<?php

namespace App\Jobs;

use App\Models\CampaignRecipient;
use App\Models\OutboundCampaign;
use App\Services\PhoneService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class MakePhoneCall implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public CampaignRecipient $recipient,
        public OutboundCampaign $campaign
    ) {
        $this->onQueue('calls');
    }

    public function handle(PhoneService $phoneService): void
    {
        try {
            $recipient = $this->recipient;
            $campaign = $this->campaign;

            // Prepare call script
            $script = $campaign->message;

            // If template is used, render it
            if ($campaign->template_id) {
                $template = \App\Models\PhoneScript::find($campaign->template_id);
                if ($template) {
                    $variables = array_merge(
                        $campaign->template_variables ?? [],
                        [
                            'customer_name' => $recipient->name ?? 'Customer',
                            'business_name' => $recipient->customer->business_name ?? '',
                        ]
                    );
                    $script = $template->render($variables);
                }
            }

            // Generate status callback URL for tracking (webhook route outside v1 prefix)
            $statusCallback = url("/outbound/phone/campaigns/{$campaign->id}/call-status");

            // Make call
            $result = $phoneService->makeCall(
                $recipient->phone,
                $script,
                [
                    'status_callback' => $statusCallback,
                    'use_tts' => true,
                    'voicemail_enabled' => true,
                ]
            );

            if ($result && ($result['success'] ?? false)) {
                $recipient->update([
                    'status' => 'sent',
                    'external_id' => $result['call_sid'] ?? null,
                    'sent_at' => now(),
                ]);

                $campaign->increment('sent_count');
            } else {
                $recipient->update([
                    'status' => 'failed',
                    'error_message' => 'Failed to initiate call',
                ]);

                $campaign->increment('failed_count');
            }
        } catch (\Exception $e) {
            Log::error('MakePhoneCall job failed', [
                'recipient_id' => $this->recipient->id,
                'campaign_id' => $this->campaign->id,
                'error' => $e->getMessage(),
            ]);

            $this->recipient->update([
                'status' => 'failed',
                'error_message' => $e->getMessage(),
            ]);

            $this->campaign->increment('failed_count');
        }
    }
}
