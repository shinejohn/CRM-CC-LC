<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Models\Customer;
use App\Services\InboundEmailService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

final class ProcessInboundEmailJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public array $payload
    ) {
        $this->onQueue('emails');
    }

    public function handle(): void
    {
        try {
            $message = $this->payload['message'] ?? [];

            // Extract email data from payload
            $fromEmail = $message['from'] ?? $message['from_address'] ?? null;
            $toEmail = $message['to'] ?? $message['to_address'] ?? null;
            $subject = $message['subject'] ?? '';
            $body = $message['plain_body'] ?? $message['html_body'] ?? '';
            $messageId = $message['id'] ?? $message['message_id'] ?? null;
            $inReplyTo = $message['in_reply_to'] ?? null;

            if (! $fromEmail || ! $toEmail) {
                Log::warning('ProcessInboundEmailJob: missing required fields', [
                    'payload' => $this->payload,
                ]);

                return;
            }

            // Inbound replies must be matched by the SENDER's FROM address — the To
            // address is Fibonacco's own inbox. Normalize (strip display name, lower,
            // trim) before matching so "Jane Doe <Jane@Example.com >" lines up with a
            // stored, lowercased customer email.
            $normalizedFrom = self::normalizeEmail($fromEmail);

            if ($normalizedFrom === '') {
                Log::warning('ProcessInboundEmailJob: unparseable from address', [
                    'from' => $fromEmail,
                ]);

                return;
            }

            $customer = Customer::where('email', $normalizedFrom)
                ->orWhere('primary_email', $normalizedFrom)
                ->first();

            if (! $customer) {
                Log::warning('ProcessInboundEmailJob: unknown customer', [
                    'from_email' => $normalizedFrom,
                ]);

                return;
            }

            // Check if customer has opted in for email
            if ($customer->email_opted_in === false) {
                Log::info('ProcessInboundEmailJob: customer opted out', [
                    'customer_id' => $customer->id,
                    'from' => $normalizedFrom,
                ]);

                return;
            }

            // Process email through InboundEmailService
            $result = app(InboundEmailService::class)->process(
                customer: $customer,
                fromEmail: $normalizedFrom,
                subject: $subject,
                body: $body,
                messageId: $messageId,
                inReplyTo: $inReplyTo
            );

            Log::info('ProcessInboundEmailJob: email processed', [
                'customer_id' => $customer->id,
                'from' => $normalizedFrom,
                'subject' => $subject,
                'intent' => $result['intent']['intent'] ?? 'unknown',
                'sentiment' => $result['sentiment'] ?? 'unknown',
                'conversation_id' => $result['conversation_id'] ?? null,
            ]);
        } catch (\Exception $e) {
            Log::error('ProcessInboundEmailJob failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'payload' => $this->payload,
            ]);

            throw $e;
        }
    }

    /**
     * Normalize an email header value to a bare, lowercased address.
     * Handles RFC 5322 display-name form: `"Jane Doe" <jane@example.com>`.
     */
    public static function normalizeEmail(?string $raw): string
    {
        if ($raw === null) {
            return '';
        }

        $value = trim($raw);

        // Extract the address inside angle brackets, if present.
        if (preg_match('/<([^>]+)>/', $value, $matches)) {
            $value = $matches[1];
        }

        return strtolower(trim($value));
    }
}
