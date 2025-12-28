<?php

namespace App\Jobs;

use App\Models\CampaignRecipient;
use App\Models\OutboundCampaign;
use App\Services\EmailService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SendEmailCampaign implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public CampaignRecipient $recipient,
        public OutboundCampaign $campaign
    ) {
        $this->onQueue('emails');
    }

    public function handle(EmailService $emailService): void
    {
        try {
            $recipient = $this->recipient;
            $campaign = $this->campaign;

            // Prepare email content
            $subject = $campaign->subject ?? 'No Subject';
            $message = $campaign->message;

            // If template is used, render it
            if ($campaign->template_id) {
                $template = \App\Models\EmailTemplate::find($campaign->template_id);
                if ($template) {
                    $variables = array_merge(
                        $campaign->template_variables ?? [],
                        [
                            'customer_name' => $recipient->name ?? 'Customer',
                            'business_name' => $recipient->customer->business_name ?? '',
                        ]
                    );
                    $rendered = $template->render($variables);
                    $subject = $rendered['subject'];
                    $message = $rendered['html'];
                }
            }

            // Send email
            $result = $emailService->send(
                $recipient->email,
                $subject,
                $message,
                null,
                [
                    'campaign_id' => $campaign->id,
                    'recipient_id' => $recipient->id,
                    'track_opens' => true,
                ]
            );

            if ($result && ($result['success'] ?? false)) {
                $recipient->update([
                    'status' => 'sent',
                    'external_id' => $result['message_id'] ?? null,
                    'sent_at' => now(),
                ]);

                $campaign->increment('sent_count');
            } else {
                $recipient->update([
                    'status' => 'failed',
                    'error_message' => 'Failed to send email',
                ]);

                $campaign->increment('failed_count');
            }
        } catch (\Exception $e) {
            Log::error('SendEmailCampaign job failed', [
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
