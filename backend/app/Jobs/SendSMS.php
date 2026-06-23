<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Models\CampaignRecipient;
use App\Models\OutboundCampaign;
use App\Services\SMSService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

final class SendSMS implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public CampaignRecipient $recipient,
        public OutboundCampaign $campaign
    ) {
        $this->onQueue('sms');
    }

    public function handle(SMSService $smsService): void
    {
        try {
            $recipient = $this->recipient;
            $campaign = $this->campaign;

            // A/B variant overrides the campaign message when assigned.
            $variant = $recipient->variant_id ? $recipient->variant : null;

            // Prepare SMS message
            $message = $variant?->message ?? $campaign->message;

            $templateId = $variant?->template_id ?? $campaign->template_id;

            // If template is used, render it
            if ($templateId) {
                $template = \App\Models\SmsTemplate::find($templateId);
                if ($template) {
                    $variables = array_merge(
                        $campaign->template_variables ?? [],
                        [
                            'customer_name' => $recipient->name ?? 'Customer',
                            'business_name' => $recipient->customer->business_name ?? '',
                        ]
                    );
                    $message = $template->render($variables);
                }
            }

            // Generate status callback URL for tracking (webhook route outside v1 prefix)
            $statusCallback = url("/outbound/sms/campaigns/{$campaign->id}/sms-status");

            // Send SMS
            $result = $smsService->send(
                $recipient->phone,
                $message,
                [
                    'campaign_id' => $campaign->id,
                    'recipient_id' => $recipient->id,
                    'status_callback' => $statusCallback,
                ]
            );

            if ($result && ($result['success'] ?? false)) {
                $recipient->update([
                    'status' => 'sent',
                    'external_id' => $result['message_sid'] ?? null,
                    'sent_at' => now(),
                ]);

                $campaign->increment('sent_count');
                if ($variant) {
                    $variant->increment('sent_count');
                }
            } else {
                $recipient->update([
                    'status' => 'failed',
                    'error_message' => 'Failed to send SMS',
                ]);

                $campaign->increment('failed_count');
            }
        } catch (\Exception $e) {
            Log::error('SendSMS job failed', [
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
