<?php

declare(strict_types=1);

namespace App\Services\Email;

use App\Enums\EmailStatus;
use App\Models\EmailMessage;

final class BounceHandlerService
{
    private SuppressionService $suppressor;

    public function __construct(SuppressionService $suppressor)
    {
        $this->suppressor = $suppressor;
    }

    /**
     * Process an incoming Postal Webhook event for a specific message.
     */
    public function process(string $event, EmailMessage $message, array $payload): void
    {
        $email = $message->to_address;
        $client = $message->client;

        if ($event === 'MessageComplained') {
            $message->update(['status' => EmailStatus::Complained]);
            $this->suppressor->addSuppression($email, 'complaint', 'postal_webhook');

            return;
        }

        if ($event === 'MessageBounced') {
            // The caller (WebhookController@handlePostalEvent) already unwraps the
            // Postal envelope and passes `$request->input('payload')`, so the bounce
            // detail lives at `payload.bounce.*` — NOT `payload.payload.bounce.*`.
            // Postal classifies delivery failures as `HardFail` / `SoftFail`
            // (see PostalWebhookController). Anything we cannot positively identify
            // as a genuine hard failure is treated as a SOFT bounce so a transient
            // problem (greylist, mailbox full, temporary outage) never permanently
            // suppresses a real contact.
            $bounceType = (string) (
                data_get($payload, 'bounce.type')
                ?? data_get($payload, 'status')
                ?? ''
            );

            if ($this->isHardBounce($bounceType)) {
                $message->update(['status' => EmailStatus::Bounced, 'error_message' => 'Hard bounce: '.$bounceType]);
                $this->suppressor->addSuppression($email, 'hard_bounce', 'postal_webhook');
            } else {
                $message->update(['status' => EmailStatus::Bounced, 'error_message' => 'Soft bounce: '.($bounceType !== '' ? $bounceType : 'unknown')]);

                // Retrieve count of recent soft bounces.
                $softBounces = EmailMessage::where('to_address', $email)
                    ->where('status', EmailStatus::Bounced)
                    ->where('error_message', 'Soft bounce')
                    ->where('created_at', '>=', now()->subDays(30))
                    ->count();

                if ($softBounces >= 5) {
                    // Global suppression
                    $this->suppressor->addSuppression($email, 'soft_bounce_escalation', 'postal_webhook');
                } elseif ($softBounces >= 3) {
                    // Client-level suppression
                    $this->suppressor->addSuppression($email, 'soft_bounce', 'postal_webhook', $client);
                }
            }
        }
    }

    /**
     * Decide whether a Postal bounce classification represents a genuine, permanent
     * (hard) failure. Unknown/empty classifications are deliberately treated as soft
     * so we never permanently suppress a contact on ambiguous webhook data.
     */
    private function isHardBounce(string $type): bool
    {
        $normalized = strtolower(trim($type));

        if ($normalized === '') {
            return false;
        }

        // Postal reports `HardFail`; also accept generic "hard"/"permanent" spellings.
        return str_contains($normalized, 'hard') || str_contains($normalized, 'permanent');
    }
}
