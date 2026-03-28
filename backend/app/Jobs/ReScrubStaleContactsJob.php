<?php

namespace App\Jobs;

use App\Models\Customer;
use App\Services\ZeroBounceService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ReScrubStaleContactsJob implements ShouldQueue
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

    public function __construct()
    {
        $this->onQueue('emails');
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

            Customer::query()
                ->whereNotNull('email')
                ->where('email', '!=', '')
                ->where('email_suppressed', false)
                ->where(function ($query) use ($staleDate) {
                    $query->whereNull('zb_checked_at')
                        ->orWhere('zb_checked_at', '<', $staleDate);
                })
                ->chunk(self::CHUNK_SIZE, function ($customers) use ($zeroBounce, &$processed, &$suppressed, &$creditsUsed, $credits) {
                    // Stop if we're running low on credits
                    if ($creditsUsed >= ($credits - 50)) {
                        Log::info('ReScrubStaleContactsJob: stopping to preserve credits', [
                            'credits_used' => $creditsUsed,
                            'credits_remaining' => $credits - $creditsUsed,
                        ]);

                        return false;
                    }

                    foreach ($customers as $customer) {
                        try {
                            $result = $zeroBounce->validate($customer->email);
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
