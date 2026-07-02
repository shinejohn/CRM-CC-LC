<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Models\Customer;
use App\Models\OutboundCampaign;
use App\Services\ZeroBounceService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

final class CampaignPreFlightJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Maximum acceptable bounce risk rate before blocking a campaign.
     */
    private const MAX_RISK_RATE = 0.03;

    /**
     * Recipients processed per DB page. Keeps memory flat regardless of list size.
     */
    private const CHUNK_SIZE = 250;

    /**
     * Blocking, HTTP-bound job over potentially large recipient lists.
     */
    public int $timeout = 1800;

    public int $tries = 3;

    public function __construct(
        public OutboundCampaign $campaign
    ) {
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
            $baseQuery = $this->campaign->recipients()->where('status', 'pending');

            $totalCount = (clone $baseQuery)->count();

            if ($totalCount === 0) {
                Log::info('CampaignPreFlightJob: no pending recipients', [
                    'campaign_id' => $this->campaign->id,
                ]);

                return;
            }

            // riskCount   = addresses we could positively assess as undeliverable/harmful
            //               (ZeroBounce suppress statuses only — genuinely invalid).
            // assessed    = addresses that returned a definitive status (fresh or cached);
            //               the risk-rate denominator. API errors are NOT assessed.
            // apiErrors   = transient ZeroBounce failures — tracked but excluded from risk
            //               so an outage can never falsely HOLD a healthy campaign.
            $riskCount = 0;
            $suppressedCount = 0;
            $assessed = 0;
            $apiErrors = 0;

            // chunkById (NOT chunk / get): we mutate `status` (a WHERE-clause column)
            // inside the loop, and we avoid loading the whole recipient list into memory.
            $baseQuery->chunkById(
                self::CHUNK_SIZE,
                function ($recipients) use ($zeroBounce, &$riskCount, &$suppressedCount, &$assessed, &$apiErrors) {
                    foreach ($recipients as $recipient) {
                        $customer = $recipient->customer;
                        $email = ProcessInboundEmailJob::normalizeEmail($recipient->email ?? '');

                        // Skip if already validated recently (within 90 days)
                        if ($customer && $customer->zb_checked_at && $customer->zb_checked_at->gt(now()->subDays(90))) {
                            $assessed++;
                            if ($customer->email_suppressed) {
                                $suppressedCount++;
                                $recipient->update([
                                    'status' => 'failed',
                                    'error_message' => "Suppressed: {$customer->email_suppressed_reason}",
                                ]);
                            }
                            if ($zeroBounce->shouldSuppress((string) $customer->zb_status)) {
                                $riskCount++;
                            }

                            continue;
                        }

                        if ($email === '') {
                            // No usable address — fail the recipient, count as risk.
                            $assessed++;
                            $riskCount++;
                            $recipient->update([
                                'status' => 'failed',
                                'error_message' => 'Missing/invalid email address',
                            ]);

                            continue;
                        }

                        // Validate via ZeroBounce
                        try {
                            $result = $zeroBounce->validate($email);
                            $status = strtolower($result['status'] ?? 'unknown');
                            $assessed++;

                            // Update customer ZB fields
                            if ($customer) {
                                $customer->update([
                                    'zb_status' => $status,
                                    'zb_sub_status' => $result['sub_status'] ?? null,
                                    'zb_checked_at' => now(),
                                ]);
                            }

                            // Suppress genuinely-bad addresses immediately (and count as risk).
                            if ($zeroBounce->shouldSuppress($status)) {
                                $riskCount++;
                                $suppressedCount++;
                                if ($customer) {
                                    $customer->update([
                                        'email_suppressed' => true,
                                        'email_suppressed_reason' => $status,
                                    ]);
                                }
                                $recipient->update([
                                    'status' => 'failed',
                                    'error_message' => "ZeroBounce: {$status}",
                                ]);
                            }
                        } catch (\Exception $e) {
                            // Transient ZB/API failure — do NOT treat as risk. An outage
                            // must not falsely hold the campaign.
                            $apiErrors++;
                            Log::warning('CampaignPreFlightJob: ZB validation failed for recipient', [
                                'email' => $email,
                                'error' => $e->getMessage(),
                            ]);
                        }
                    }
                }
            );

            // Guard divide-by-zero; denominator is only the definitively-assessed set.
            $riskRate = $assessed > 0 ? $riskCount / $assessed : 0.0;

            Log::info('CampaignPreFlightJob: validation complete', [
                'campaign_id' => $this->campaign->id,
                'total_recipients' => $totalCount,
                'assessed' => $assessed,
                'risk_count' => $riskCount,
                'suppressed_count' => $suppressedCount,
                'api_errors' => $apiErrors,
                'risk_rate' => round($riskRate * 100, 2).'%',
            ]);

            // Block campaign if risk exceeds threshold
            if ($riskRate > self::MAX_RISK_RATE) {
                $this->campaign->update([
                    'status' => 'held',
                    'metadata' => array_merge($this->campaign->metadata ?? [], [
                        'held_reason' => 'high_bounce_risk',
                        'risk_rate' => round($riskRate * 100, 2),
                        'risk_count' => $riskCount,
                        'suppressed_count' => $suppressedCount,
                        'held_at' => now()->toISOString(),
                    ]),
                ]);

                Log::warning('CampaignPreFlightJob: campaign held due to high bounce risk', [
                    'campaign_id' => $this->campaign->id,
                    'risk_rate' => round($riskRate * 100, 2).'%',
                    'threshold' => (self::MAX_RISK_RATE * 100).'%',
                ]);
            } else {
                // Update campaign metadata with validation results
                $this->campaign->update([
                    'metadata' => array_merge($this->campaign->metadata ?? [], [
                        'preflight_passed' => true,
                        'preflight_risk_rate' => round($riskRate * 100, 2),
                        'preflight_suppressed' => $suppressedCount,
                        'preflight_at' => now()->toISOString(),
                    ]),
                ]);
            }
        } catch (\Exception $e) {
            Log::error('CampaignPreFlightJob failed', [
                'campaign_id' => $this->campaign->id,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }
}
