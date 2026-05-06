<?php

declare(strict_types=1);

namespace App\Services;

use App\Events\InboundEmailReceived;
use App\Models\Conversation;
use App\Models\Customer;
use App\Models\EmailSuppression;
use Illuminate\Support\Facades\Log;

final class InboundEmailService
{
    public function __construct(
        protected EmailIntentClassifier $intentClassifier,
        protected EmailSentimentAnalyzer $sentimentAnalyzer
    ) {}

    /**
     * Detect opt-out keywords in email body and subject.
     *
     * Uses word boundary matching to avoid false positives
     * (e.g. "unstoppable" should not match "stop").
     */
    public function detectOptOut(string $body, string $subject): bool
    {
        $keywords = [
            'stop',
            'unsubscribe',
            'remove me',
            'opt out',
            'opt-out',
            'do not contact',
            'cancel subscription',
        ];

        $pattern = '/\b('.implode('|', array_map('preg_quote', $keywords)).')\b/i';

        return (bool) preg_match($pattern, $body) || (bool) preg_match($pattern, $subject);
    }

    /**
     * Process an inbound email.
     */
    public function process(
        Customer $customer,
        string $fromEmail,
        string $subject,
        string $body,
        ?string $messageId = null,
        ?string $inReplyTo = null
    ): array {
        // Check for opt-out keywords before any other processing
        if ($this->detectOptOut($body, $subject)) {
            $customer->update([
                'email_opted_in' => false,
                'do_not_contact' => true,
            ]);

            EmailSuppression::create([
                'email_address' => $fromEmail,
                'reason' => 'unsubscribe',
                'source' => 'inbound_email',
            ]);

            Log::info('Opt-out detected from inbound email', [
                'customer_id' => $customer->id,
                'email' => $fromEmail,
                'subject' => $subject,
            ]);

            return [
                'opted_out' => true,
                'customer_id' => $customer->id,
            ];
        }

        // Classify intent
        $intent = $this->intentClassifier->classify($subject, $body);

        // Analyze sentiment
        $sentiment = $this->sentimentAnalyzer->analyze($body);

        // Log conversation
        $conversation = $this->logConversation($customer, $subject, $body, $intent, $sentiment, $inReplyTo);

        // Fire event with classified intent and sentiment
        event(new InboundEmailReceived(
            customer: $customer,
            fromEmail: $fromEmail,
            subject: $subject,
            body: $body,
            messageId: $messageId,
            inReplyTo: $inReplyTo,
            sentiment: $sentiment,
            classifiedIntent: $intent['intent']
        ));

        Log::info('Inbound email processed', [
            'customer_id' => $customer->id,
            'intent' => $intent['intent'],
            'sentiment' => $sentiment,
            'conversation_id' => $conversation->id,
        ]);

        return [
            'conversation_id' => $conversation->id,
            'intent' => $intent,
            'sentiment' => $sentiment,
        ];
    }

    protected function logConversation(
        Customer $customer,
        string $subject,
        string $body,
        array $intent,
        string $sentiment,
        ?string $inReplyTo
    ): Conversation {
        return Conversation::create([
            'customer_id' => $customer->id,
            'tenant_id' => $customer->tenant_id,
            'session_id' => 'session_'.\Illuminate\Support\Str::random(32),
            'entry_point' => 'email',
            'messages' => [
                [
                    'role' => 'user',
                    'content' => $body,
                    'timestamp' => now()->toISOString(),
                ],
            ],
            'sentiment_trajectory' => [$sentiment],
            'outcome' => $intent['intent'],
            'new_data_collected' => [
                'subject' => $subject,
                'intent' => $intent,
                'in_reply_to' => $inReplyTo,
            ],
            'started_at' => now(),
        ]);
    }
}
