<?php

namespace App\Services;

use App\Models\Customer;
use App\Events\InboundEmailReceived;
use App\Models\Conversation;
use Illuminate\Support\Facades\Log;

class InboundEmailService
{
    public function __construct(
        protected EmailIntentClassifier $intentClassifier,
        protected EmailSentimentAnalyzer $sentimentAnalyzer
    ) {
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
            'session_id' => 'session_' . \Illuminate\Support\Str::random(32),
            'entry_point' => 'email',
            'messages' => [
                [
                    'role' => 'user',
                    'content' => $body,
                    'timestamp' => now()->toISOString(),
                ]
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

