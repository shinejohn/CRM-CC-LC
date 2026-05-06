<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Jobs\ProcessInboundEmailJob;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

final class WebhookController extends Controller
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
            if (! $this->verifyPostalSignature($request)) {
                Log::warning('Invalid Postal inbound email webhook signature');

                return response()->json(['error' => 'Invalid signature'], 401);
            }

            $payload = $request->all();
            $message = $payload['message'] ?? [];

            // Basic field validation before dispatching
            $fromEmail = $message['from'] ?? $message['from_address'] ?? null;
            $toEmail = $message['to'] ?? $message['to_address'] ?? null;

            if (! $fromEmail || ! $toEmail) {
                Log::warning('Inbound email webhook missing required fields', [
                    'payload' => $payload,
                ]);

                return response()->json(['error' => 'Missing required fields'], 400);
            }

            Log::info('Received inbound email webhook from Postal, dispatching job', [
                'from' => $fromEmail,
                'to' => $toEmail,
                'subject' => $message['subject'] ?? '',
                'message_id' => $message['id'] ?? $message['message_id'] ?? null,
            ]);

            ProcessInboundEmailJob::dispatch($payload);

            return response()->json(['status' => 'queued']);

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

        if (! $secret || ! $signature) {
            // If signature verification is not configured, allow the request
            // In production, this should be required
            return true;
        }

        $expected = base64_encode(hash_hmac('sha1', $payload, $secret, true));

        return hash_equals($expected, $signature);
    }
}
