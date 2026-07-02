<?php

declare(strict_types=1);

namespace App\Services;

use App\Events\InboundEmailReceived;
use App\Jobs\ProcessInboundEmailJob;
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
     * Detect an explicit opt-out request in an inbound reply.
     *
     * IMPORTANT: only the recipient's OWN new text is scanned. The quoted original
     * message is stripped first, because every outbound email carries an injected
     * "Unsubscribe" footer + List-Unsubscribe copy — scanning the quote would flag
     * every single reply as an opt-out. Patterns require explicit intent; a bare
     * "stop" embedded in prose does NOT trigger (only phrases like "stop emailing").
     */
    public function detectOptOut(string $body, string $subject): bool
    {
        $scannable = $this->stripQuotedReply($body);

        // Explicit opt-out intent only. No bare "stop".
        $patterns = [
            '/\bunsubscribe\b/i',
            '/\bremove me\b/i',
            '/\btake me off\b/i',
            '/\bopt[\s-]?out\b/i',
            '/\bdo(?:\s+not|n\'?t)\s+(?:contact|email|message|mail)\b/i',
            '/\bstop\s+(?:emailing|e-mailing|contacting|messaging|mailing|sending|texting)\b/i',
            '/\bcancel(?:\s+my)?\s+subscription\b/i',
            '/\bno\s+more\s+emails?\b/i',
        ];

        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $scannable) || preg_match($pattern, $subject)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Return only the recipient's newly-written text, cutting the reply at the first
     * quoted/original-message delimiter so the injected unsubscribe footer (and any
     * older opt-out language) in the quoted thread is not scanned.
     */
    public function stripQuotedReply(string $body): string
    {
        $delimiters = [
            '/^>.*/m',                              // quoted lines ("> ...")
            '/^\s*On\b.{0,200}\bwrote:/mi',         // Gmail / Apple Mail attribution
            '/-{2,}\s*Original Message\s*-{2,}/i',  // Outlook
            '/-{2,}\s*Forwarded message\s*-{2,}/i', // forwarded threads
            '/^\s*From:\s.+$/mi',                    // Outlook header block start
            '/^_{5,}\s*$/m',                         // Outlook underscore separator
            '/^\s*Sent from my \w+/mi',             // mobile signatures preceding quotes
        ];

        $cut = strlen($body);

        foreach ($delimiters as $delimiter) {
            if (preg_match($delimiter, $body, $matches, PREG_OFFSET_CAPTURE)) {
                $cut = min($cut, $matches[0][1]);
            }
        }

        return trim(substr($body, 0, $cut));
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

            $suppressEmail = ProcessInboundEmailJob::normalizeEmail($fromEmail);

            EmailSuppression::updateOrCreate(
                [
                    'email_address' => $suppressEmail,
                    'email_client_id' => null,
                ],
                [
                    'reason' => 'unsubscribe',
                    'source' => 'inbound_email',
                ]
            );

            Log::info('Opt-out detected from inbound email', [
                'customer_id' => $customer->id,
                'email' => $suppressEmail,
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
