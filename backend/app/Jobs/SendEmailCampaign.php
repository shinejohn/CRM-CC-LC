<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Enums\PoolType;
use App\Models\CampaignRecipient;
use App\Models\EmailPool;
use App\Models\OutboundCampaign;
use App\Services\Email\PostalService;
use App\Services\EmailService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

final class SendEmailCampaign implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public int $backoff = 60;

    public function __construct(
        public CampaignRecipient $recipient,
        public OutboundCampaign $campaign
    ) {
        $this->onQueue('emails');
    }

    public function handle(PostalService $postalService, EmailService $emailService): void
    {
        try {
            $recipient = $this->recipient->fresh();
            $campaign = $this->campaign->fresh();

            if (! $recipient || ! $campaign) {
                return;
            }

            // Skip already sent/failed recipients
            if (in_array($recipient->status, ['sent', 'delivered', 'opened', 'clicked', 'replied'], true)) {
                return;
            }

            // Resolve content. If the recipient was assigned an A/B variant,
            // its subject/message override the campaign's own. No variant →
            // unchanged behavior (campaign subject/message).
            $variant = $recipient->variant_id ? $recipient->variant : null;

            $subject = $variant?->subject ?? $campaign->subject ?? 'No Subject';
            $html = $variant?->message ?? $campaign->message ?? '';

            $templateId = $variant?->template_id ?? $campaign->template_id;

            if ($templateId) {
                $template = \App\Models\EmailTemplate::find($templateId);
                if ($template) {
                    $variables = array_merge(
                        $campaign->template_variables ?? [],
                        [
                            'customer_name' => $recipient->name ?? 'Customer',
                            'business_name' => $recipient->customer?->business_name ?? '',
                            'community_name' => $recipient->customer?->community?->name ?? '',
                        ]
                    );
                    $rendered = $template->render($variables);
                    $subject = $rendered['subject'];
                    $html = $rendered['html'];
                }
            }

            $sent = $this->sendViaPool($postalService, $recipient->email, $subject, $html, $recipient, $campaign);

            if (! $sent) {
                // Fallback to legacy EmailService (env-var Postal or SendGrid)
                $sent = $this->sendViaLegacy($emailService, $recipient->email, $subject, $html, $recipient, $campaign);
            }

            if ($sent) {
                $recipient->update(['status' => 'sent', 'sent_at' => now()]);
                $campaign->increment('sent_count');
                if ($variant) {
                    $variant->increment('sent_count');
                }
            } else {
                $recipient->update(['status' => 'failed', 'error_message' => 'All send paths failed']);
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

            throw $e;
        }
    }

    /**
     * Send via the CC's own email platform (email_pools → PostalService).
     * Returns true on success, false if pool not configured.
     */
    private function sendViaPool(
        PostalService $postalService,
        string $to,
        string $subject,
        string $html,
        CampaignRecipient $recipient,
        OutboundCampaign $campaign
    ): bool {
        $pool = EmailPool::where('pool_type', PoolType::SmbCampaign)->first()
            ?? EmailPool::where('pool_type', PoolType::Broadcast)->first();

        if (! $pool || ! $pool->api_url || ! $pool->api_key) {
            return false;
        }

        // Build a transient EmailMessage-like object for PostalService
        $message = new \App\Models\EmailMessage([
            'to_address' => $to,
            'subject' => $subject,
            'payload_log' => [
                'html_body' => $html,
                'plain_body' => strip_tags($html),
            ],
        ]);
        // Inject sender and pool as relations
        $sender = new \App\Models\EmailSender(['email_address' => $pool->username ?? config('services.postal.from_address')]);
        $message->setRelation('sender', $sender);
        $message->setRelation('pool', $pool);
        $message->id = $recipient->id; // Used for X-Fibonacco-Message-ID header for webhook tracking

        $response = $postalService->send($message);

        $messageId = data_get($response, 'data.message_id')
            ?? data_get($response, 'messages.0.id')
            ?? null;

        $recipient->update([
            'external_id' => $messageId,
            'metadata' => array_merge($recipient->metadata ?? [], [
                'provider' => 'postal_pool',
                'pool_type' => 'smb_campaign',
            ]),
        ]);

        return true;
    }

    /**
     * Send via legacy EmailService (env-var driven Postal / SendGrid / SES).
     */
    private function sendViaLegacy(
        EmailService $emailService,
        string $to,
        string $subject,
        string $html,
        CampaignRecipient $recipient,
        OutboundCampaign $campaign
    ): bool {
        $result = $emailService->send($to, $subject, $html, null, [
            'campaign_id' => $campaign->id,
            'recipient_id' => $recipient->id,
            'ip_pool' => 'smb_campaign',
            'track_opens' => true,
        ]);

        if ($result && ($result['success'] ?? false)) {
            $recipient->update([
                'external_id' => $result['message_id'] ?? null,
                'metadata' => array_merge($recipient->metadata ?? [], [
                    'provider' => $result['provider'] ?? 'legacy',
                    'ip_pool' => $result['ip_pool'] ?? null,
                ]),
            ]);

            return true;
        }

        return false;
    }
}
