<?php

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

class CampaignPreFlightJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Maximum acceptable bounce risk rate before blocking a campaign.
     */
    private const MAX_RISK_RATE = 0.03;

    public function __construct(
        public OutboundCampaign $campaign
    ) {
        $this->onQueue('emails');
    }

    public function handle(ZeroBounceService $zeroBounce): void
    {
        try {
            $recipients = $this->campaign->recipients()
                ->where('status', 'pending')
                ->get();

            if ($recipients->isEmpty()) {
                Log::info('CampaignPreFlightJob: no pending recipients', [
                    'campaign_id' => $this->campaign->id,
                ]);

                return;
            }

            $totalCount = $recipients->count();
            $riskCount = 0;
            $suppressedCount = 0;

            foreach ($recipients as $recipient) {
                $customer = $recipient->customer;
                $email = $recipient->email;

                // Skip if already validated recently (within 90 days)
                if ($customer && $customer->zb_checked_at && $customer->zb_checked_at->gt(now()->subDays(90))) {
                    if ($customer->email_suppressed) {
                        $suppressedCount++;
                        $recipient->update([
                            'status' => 'failed',
                            'error_message' => "Suppressed: {$customer->email_suppressed_reason}",
                        ]);
                    }
                    if (in_array($customer->zb_status, ['invalid', 'unknown', 'catch-all'])) {
                        $riskCount++;
                    }

                    continue;
                }

                // Validate via ZeroBounce
                try {
                    $result = $zeroBounce->validate($email);
                    $status = strtolower($result['status'] ?? 'unknown');

                    // Update customer ZB fields
                    if ($customer) {
                        $customer->update([
                            'zb_status' => $status,
                            'zb_sub_status' => $result['sub_status'] ?? null,
                            'zb_checked_at' => now(),
                        ]);
                    }

                    // Suppress bad addresses immediately
                    if ($zeroBounce->shouldSuppress($status)) {
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

                    // Count risky addresses
                    if (in_array($status, ['invalid', 'unknown', 'catch-all'])) {
                        $riskCount++;
                    }
                } catch (\Exception $e) {
                    Log::warning('CampaignPreFlightJob: ZB validation failed for recipient', [
                        'email' => $email,
                        'error' => $e->getMessage(),
                    ]);
                    $riskCount++; // Count failures as risky
                }
            }

            $riskRate = $totalCount > 0 ? $riskCount / $totalCount : 0;

            Log::info('CampaignPreFlightJob: validation complete', [
                'campaign_id' => $this->campaign->id,
                'total_recipients' => $totalCount,
                'risk_count' => $riskCount,
                'suppressed_count' => $suppressedCount,
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
