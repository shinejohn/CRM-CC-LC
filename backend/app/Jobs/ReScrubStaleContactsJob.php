<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Models\Customer;
use App\Services\ZeroBounceService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

final class ReScrubStaleContactsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Re-validate contacts older than this many days.
     */
    private const STALE_DAYS = 90;

    /**
     * Process contacts in chunks of this size.
     */
    private const CHUNK_SIZE = 100;

    /**
     * Hard cap on ZeroBounce single-validate HTTP calls per run.
     *
     * The eligible pool can be hundreds of thousands of rows (~386K enrolled).
     * Validating them all in one job would mean ~386K sequential blocking HTTP
     * calls — hours of runtime and a huge credit burn. We deliberately bound each
     * run to a fixed slice; because we order by id and re-scan by `zb_checked_at`,
     * the oldest-unchecked rows are picked up first and the remainder are handled
     * on subsequent scheduled runs until the whole pool rolls over.
     */
    private const MAX_PER_RUN = 5000;

    /**
     * Long-running job: allow up to 30 minutes and a couple of retries with backoff.
     */
    public int $timeout = 1800;

    public int $tries = 3;

    public function __construct()
    {
        $this->onQueue('emails');
    }

    /**
     * Progressive backoff (seconds) between retries.
     *
     * @return array<int, int>
     */
    public function backoff(): array
    {
        return [60, 300, 900];
    }

    public function handle(ZeroBounceService $zeroBounce): void
    {
        try {
            // Check available credits before starting
            $credits = $zeroBounce->getCredits();
            if ($credits < 100) {
                Log::warning('ReScrubStaleContactsJob: insufficient ZeroBounce credits', [
                    'credits_remaining' => $credits,
                ]);

                return;
            }

            $staleDate = now()->subDays(self::STALE_DAYS);
            $processed = 0;
            $suppressed = 0;
            $creditsUsed = 0;

            // chunkById (NOT chunk): the loop mutates `zb_checked_at`, a column in
            // the WHERE clause. Offset-based chunk() would re-page against a shifting
            // result set and skip ~half the rows each run; chunkById paginates by the
            // stable primary key instead.
            Customer::query()
                ->whereNotNull('email')
                ->where('email', '!=', '')
                ->where('email_suppressed', false)
                ->where(function ($query) use ($staleDate) {
                    $query->whereNull('zb_checked_at')
                        ->orWhere('zb_checked_at', '<', $staleDate);
                })
                ->chunkById(self::CHUNK_SIZE, function ($customers) use ($zeroBounce, &$processed, &$suppressed, &$creditsUsed, $credits) {
                    // Stop if we're running low on credits
                    if ($creditsUsed >= ($credits - 50)) {
                        Log::info('ReScrubStaleContactsJob: stopping to preserve credits', [
                            'credits_used' => $creditsUsed,
                            'credits_remaining' => $credits - $creditsUsed,
                        ]);

                        return false;
                    }

                    // Bound total work per run — see MAX_PER_RUN doc block.
                    if ($processed >= self::MAX_PER_RUN) {
                        Log::info('ReScrubStaleContactsJob: reached per-run cap', [
                            'processed' => $processed,
                            'cap' => self::MAX_PER_RUN,
                        ]);

                        return false;
                    }

                    foreach ($customers as $customer) {
                        if ($processed >= self::MAX_PER_RUN) {
                            return false;
                        }

                        try {
                            $email = ProcessInboundEmailJob::normalizeEmail($customer->email);
                            if ($email === '') {
                                continue;
                            }

                            $result = $zeroBounce->validate($email);
                            $status = strtolower($result['status'] ?? 'unknown');
                            $creditsUsed++;

                            $customer->update([
                                'zb_status' => $status,
                                'zb_sub_status' => $result['sub_status'] ?? null,
                                'zb_checked_at' => now(),
                            ]);

                            if ($zeroBounce->shouldSuppress($status)) {
                                $customer->update([
                                    'email_suppressed' => true,
                                    'email_suppressed_reason' => $status,
                                ]);
                                $suppressed++;
                            }

                            $processed++;
                        } catch (\Exception $e) {
                            Log::warning('ReScrubStaleContactsJob: validation failed', [
                                'customer_id' => $customer->id,
                                'email' => $customer->email,
                                'error' => $e->getMessage(),
                            ]);
                        }
                    }
                });

            Log::info('ReScrubStaleContactsJob: complete', [
                'processed' => $processed,
                'suppressed' => $suppressed,
                'credits_used' => $creditsUsed,
            ]);
        } catch (\Exception $e) {
            Log::error('ReScrubStaleContactsJob failed', [
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }
}
