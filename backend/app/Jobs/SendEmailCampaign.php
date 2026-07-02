<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Enums\PoolType;
use App\Models\CampaignRecipient;
use App\Models\EmailPool;
use App\Models\EmailSuppression;
use App\Models\OutboundCampaign;
use App\Services\Email\PostalService;
use App\Services\EmailService;
use App\Services\ZeroBounceService;
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

    public function handle(PostalService $postalService, EmailService $emailService, ZeroBounceService $zeroBounce): void
    {
        $recipient = $this->recipient->fresh();
        $campaign = $this->campaign->fresh();

        if (! $recipient || ! $campaign) {
            return;
        }

        // (c) IDEMPOTENCY: if this recipient was already sent (or advanced past
        // sent), never re-send. Protects against a worker dying AFTER the Postal
        // accept but BEFORE the job acked — the retry lands here and no-ops.
        if (in_array($recipient->status, ['sent', 'delivered', 'opened', 'clicked', 'replied', 'answered', 'voicemail'], true)) {
            return;
        }

        // Pre-flight gate: another agent's CampaignPreFlightJob sets status='held'
        // when >3% of the list looks risky. Do NOT send while held. Leave the
        // recipient 'pending'; the un-hold / re-dispatch path re-queues sends.
        if ($campaign->status === 'held') {
            Log::info('SendEmailCampaign skipped: campaign held by pre-flight gate', [
                'recipient_id' => $recipient->id,
                'campaign_id' => $campaign->id,
            ]);

            return;
        }

        // (a) SUPPRESSION: mirror EmailService / Customer::canContactViaEmail +
        // scopeCanReceiveEmail. Skip (mark 'suppressed', do not count as failure)
        // rather than mailing a suppressed / opted-out / DNC / invalid address.
        $suppressionReason = $this->suppressionReason($recipient, $zeroBounce);
        if ($suppressionReason !== null) {
            $recipient->update([
                'status' => 'suppressed',
                'error_message' => $suppressionReason,
            ]);
            Log::info('SendEmailCampaign skipped: recipient suppressed', [
                'recipient_id' => $recipient->id,
                'campaign_id' => $campaign->id,
                'reason' => $suppressionReason,
            ]);

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

        // (b) Only advance state AFTER the provider actually accepted the message.
        if ($sent) {
            $recipient->update(['status' => 'sent', 'sent_at' => now()]);
            $campaign->increment('sent_count');
            if ($variant) {
                $variant->increment('sent_count');
            }

            return;
        }

        // Provider rejected / not configured on all paths. Throw so the queue
        // retries (tries=3). Failure accounting happens once in failed(), NOT
        // here — otherwise every retry would double-count failed_count.
        throw new \RuntimeException('SendEmailCampaign: all send paths failed for recipient '.$recipient->id);
    }

    /**
     * Final-failure hook: runs once after retries are exhausted (or on a
     * non-retryable throw). Marks the recipient failed and counts it a single
     * time. Never overwrites a recipient that already made it to 'sent'.
     */
    public function failed(\Throwable $e): void
    {
        $recipient = $this->recipient->fresh();

        if (! $recipient) {
            return;
        }

        if (in_array($recipient->status, ['sent', 'delivered', 'opened', 'clicked', 'replied', 'answered', 'voicemail', 'suppressed'], true)) {
            return;
        }

        Log::error('SendEmailCampaign permanently failed', [
            'recipient_id' => $recipient->id,
            'campaign_id' => $this->campaign->id,
            'error' => $e->getMessage(),
        ]);

        $recipient->update([
            'status' => 'failed',
            'error_message' => $e->getMessage(),
        ]);

        $this->campaign->increment('failed_count');
    }

    /**
     * Determine whether this recipient must be skipped, and why.
     * Returns a human-readable reason string, or null when clear to send.
     */
    private function suppressionReason(CampaignRecipient $recipient, ZeroBounceService $zeroBounce): ?string
    {
        $email = $recipient->email;

        if (! is_string($email) || $email === '') {
            return 'No email address';
        }

        // Global suppression list (bounces / complaints / manual).
        if (EmailSuppression::where('email_address', $email)->exists()) {
            return 'On suppression list';
        }

        $customer = $recipient->customer;

        if ($customer) {
            if ($customer->do_not_contact) {
                return 'Customer flagged do_not_contact';
            }

            if ($customer->email_suppressed) {
                return 'Customer email suppressed: '.($customer->email_suppressed_reason ?? 'unknown');
            }

            if (! $customer->email_opted_in) {
                return 'Customer not opted in to email';
            }

            // ZeroBounce status — only block when we have a status and it is
            // known-unsendable (invalid / spamtrap / abuse / do_not_mail).
            $zbStatus = $customer->zb_status;
            if (is_string($zbStatus) && $zbStatus !== '' && ! $zeroBounce->isSendable($zbStatus)) {
                return 'ZeroBounce status unsendable: '.$zbStatus;
            }
        }

        return null;
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

        // One-click unsubscribe headers (RFC 8058 / Gmail-Yahoo bulk-sender requirement).
        // The signed unsubscribe URL is already computed into the campaign's merge vars.
        $headers = [];
        $unsubscribeUrl = $campaign->template_variables['unsubscribe_url'] ?? null;
        if (is_string($unsubscribeUrl) && $unsubscribeUrl !== '') {
            $mailto = (string) config('mail.unsubscribe_mailto', 'unsubscribe@day.news');
            $headers['List-Unsubscribe'] = '<'.$unsubscribeUrl.'>, <mailto:'.$mailto.'>';
            $headers['List-Unsubscribe-Post'] = 'List-Unsubscribe=One-Click';
        }

        // Build a transient EmailMessage-like object for PostalService
        $message = new \App\Models\EmailMessage([
            'to_address' => $to,
            'subject' => $subject,
            'payload_log' => [
                'html_body' => $html,
                'plain_body' => strip_tags($html),
                'headers' => $headers,
            ],
        ]);
        // Inject sender and pool as relations
        $sender = new \App\Models\EmailSender(['email_address' => $pool->username ?? config('services.postal.from_address')]);
        $message->setRelation('sender', $sender);
        $message->setRelation('pool', $pool);
        $message->id = $recipient->id; // Used for X-Fibonacco-Message-ID header for webhook tracking

        try {
            $response = $postalService->send($message);
        } catch (\Throwable $e) {
            // HTTP/transport error talking to Postal. Return false so the legacy
            // path can be attempted; if that also fails the job retries.
            Log::warning('SendEmailCampaign: Postal send threw', [
                'recipient_id' => $recipient->id,
                'error' => $e->getMessage(),
            ]);

            return false;
        }

        // Postal returns {"status":"success","data":{"message_id":...}} on accept
        // and {"status":"error",...} on rejection. Only treat an explicit success
        // WITH a message id as sent — never advance state on an ambiguous response.
        $status = data_get($response, 'status');
        $messageId = data_get($response, 'data.message_id')
            ?? data_get($response, 'messages.0.id')
            ?? data_get($response, 'data.messages.0.id')
            ?? null;

        $accepted = ($status === 'success' || $status === null) && $messageId !== null;

        if (! $accepted) {
            Log::warning('SendEmailCampaign: Postal did not accept message', [
                'recipient_id' => $recipient->id,
                'status' => $status,
                'response' => $response,
            ]);

            return false;
        }

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
            'customer_id' => $recipient->customer_id,
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
