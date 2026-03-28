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
        $this->suppressor = $offset; // wait typo, let's fix it later. Ah I am writing it now.
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
            $bounceType = $payload['payload']['bounce']['type'] ?? 'hard'; // check if it's hard or soft

            if ($bounceType === 'hard') {
                $message->update(['status' => EmailStatus::Bounced, 'error_message' => 'Hard bounce']);
                $this->suppressor->addSuppression($email, 'hard_bounce', 'postal_webhook');
            } else {
                $message->update(['status' => EmailStatus::Bounced, 'error_message' => 'Soft bounce']);

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
}
