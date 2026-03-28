<?php

namespace App\Jobs;

use App\Models\Customer;
use App\Services\InboundEmailService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProcessInboundEmailJob implements ShouldQueue
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

            // Find customer by email address
            $customer = Customer::where('email', $toEmail)
                ->orWhere('primary_email', $toEmail)
                ->first();

            if (! $customer) {
                Log::warning('ProcessInboundEmailJob: unknown customer', [
                    'to_email' => $toEmail,
                ]);

                return;
            }

            // Check if customer has opted in for email
            if ($customer->email_opted_in === false) {
                Log::info('ProcessInboundEmailJob: customer opted out', [
                    'customer_id' => $customer->id,
                    'from' => $fromEmail,
                ]);

                return;
            }

            // Process email through InboundEmailService
            $result = app(InboundEmailService::class)->process(
                customer: $customer,
                fromEmail: $fromEmail,
                subject: $subject,
                body: $body,
                messageId: $messageId,
                inReplyTo: $inReplyTo
            );

            Log::info('ProcessInboundEmailJob: email processed', [
                'customer_id' => $customer->id,
                'from' => $fromEmail,
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
}
