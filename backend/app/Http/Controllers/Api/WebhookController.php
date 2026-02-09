<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Events\InboundEmailReceived;
use App\Services\InboundEmailService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class WebhookController extends Controller
{
    public function ses(Request $request): JsonResponse
    {
        return response()->json(['status' => 'received']);
    }

    public function rvm(Request $request): JsonResponse
    {
        return response()->json(['status' => 'received']);
    }

    public function twilio(Request $request): JsonResponse
    {
        return response()->json(['status' => 'received']);
    }

    /**
     * Handle inbound email webhook from Postal
     * 
     * POST /webhooks/postal/inbound
     */
    public function inboundEmail(Request $request): JsonResponse
    {
        try {
            // Validate webhook signature if configured
            if (!$this->verifyPostalSignature($request)) {
                Log::warning('Invalid Postal inbound email webhook signature');
                return response()->json(['error' => 'Invalid signature'], 401);
            }

            $payload = $request->all();
            $message = $payload['message'] ?? [];
            
            // Extract email data
            $fromEmail = $message['from'] ?? $message['from_address'] ?? null;
            $toEmail = $message['to'] ?? $message['to_address'] ?? null;
            $subject = $message['subject'] ?? '';
            $body = $message['plain_body'] ?? $message['html_body'] ?? '';
            $messageId = $message['id'] ?? $message['message_id'] ?? null;
            $inReplyTo = $message['in_reply_to'] ?? null;

            if (!$fromEmail || !$toEmail) {
                Log::warning('Inbound email webhook missing required fields', [
                    'payload' => $payload,
                ]);
                return response()->json(['error' => 'Missing required fields'], 400);
            }

            Log::info('Received inbound email webhook from Postal', [
                'from' => $fromEmail,
                'to' => $toEmail,
                'subject' => $subject,
                'message_id' => $messageId,
            ]);

            // Find customer by email address
            $customer = Customer::where('email', $toEmail)
                ->orWhere('primary_email', $toEmail)
                ->first();

            if (!$customer) {
                Log::warning('Inbound email received for unknown customer', [
                    'to_email' => $toEmail,
                ]);
                
                // Return success but don't process
                return response()->json([
                    'status' => 'received',
                    'message' => 'Unknown recipient',
                ]);
            }

            // Check if customer has opted in for email
            if (!$customer->email_opted_in) {
                Log::info('Inbound email received from opted-out customer', [
                    'customer_id' => $customer->id,
                    'from' => $fromEmail,
                ]);
                
                return response()->json([
                    'status' => 'received',
                    'message' => 'Customer opted out',
                ]);
            }

            // Process email through InboundEmailService
            // This will classify intent, analyze sentiment, log conversation, and fire event
            $inboundEmailService = app(InboundEmailService::class);
            $result = $inboundEmailService->process(
                customer: $customer,
                fromEmail: $fromEmail,
                subject: $subject,
                body: $body,
                messageId: $messageId,
                inReplyTo: $inReplyTo
            );

            Log::info('Inbound email processed', [
                'customer_id' => $customer->id,
                'from' => $fromEmail,
                'subject' => $subject,
                'intent' => $result['intent']['intent'] ?? 'unknown',
                'sentiment' => $result['sentiment'] ?? 'unknown',
                'conversation_id' => $result['conversation_id'] ?? null,
            ]);

            return response()->json([
                'status' => 'received',
                'message' => 'Email processed successfully',
            ]);

        } catch (\Exception $e) {
            Log::error('Error processing inbound email webhook', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->all(),
            ]);

            // Return success to prevent retries
            return response()->json([
                'status' => 'received',
                'error' => 'Internal processing error',
            ], 200);
        }
    }

    /**
     * Verify Postal webhook signature
     */
    protected function verifyPostalSignature(Request $request): bool
    {
        $secret = config('services.postal.webhook_secret');
        $signature = $request->header('X-Postal-Signature');
        $payload = $request->getContent();

        if (!$secret || !$signature) {
            // If signature verification is not configured, allow the request
            // In production, this should be required
            return true;
        }

        $expected = base64_encode(hash_hmac('sha1', $payload, $secret, true));

        return hash_equals($expected, $signature);
    }
}



