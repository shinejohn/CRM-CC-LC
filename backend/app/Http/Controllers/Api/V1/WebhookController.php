<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\EmailMessage;
use App\Services\Email\BounceHandlerService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

final class WebhookController extends Controller
{
    private BounceHandlerService $bounceHandler;

    public function __construct(BounceHandlerService $bounceHandler)
    {
        $this->bounceHandler = $bounceHandler;
    }

    /**
     * POST /api/v1/email/webhook/postal
     */
    public function handlePostalEvent(Request $request): JsonResponse
    {
        // 1. Verify Signature
        $signature = $request->header('X-Postal-Signature');

        $signingKey = config('services.postal.webhook_signing_key');
        if ($signingKey) {
            $expectedSignature = base64_encode(hash_hmac('sha256', $request->getContent(), $signingKey, true));
            if (! hash_equals($expectedSignature, $signature ?? '')) {
                Log::warning('Postal Webhook: Invalid signature.');

                return response()->json(['error' => 'Invalid signature'], 403);
            }
        }

        // 2. Parse Event
        $event = $request->input('event');
        $payload = $request->input('payload', []);

        $messageId = $payload['message']['headers']['X-Fibonacco-Message-ID']
            ?? $payload['message']['headers']['x-fibonacco-message-id']
            ?? null;

        if (! $messageId) {
            // Cannot track this back to our DB
            return response()->json(['status' => 'ignored', 'reason' => 'No custom message ID']);
        }

        $emailMessage = EmailMessage::find($messageId);
        if (! $emailMessage) {
            return response()->json(['status' => 'ignored', 'reason' => 'Message not found']);
        }

        // 3. Status updates based on event
        switch ($event) {
            case 'MessageSent':
                $emailMessage->update(['status' => 'delivered', 'delivered_at' => now()]);
                break;
            case 'MessageHeld':
                $emailMessage->update(['status' => 'held']);
                break;
            case 'MessageFailed':
                $emailMessage->update(['status' => 'failed', 'error_message' => 'Delivery failed in Postal']);
                break;
            case 'MessageBounced':
            case 'MessageComplained':
                $this->bounceHandler->process($event, $emailMessage, $payload);
                break;
            case 'MessageOpened':
            case 'MessageLinkClicked':
                // Handled downstream via metrics/analytics, ignored for bounce handling here
                break;
            default:
                Log::info("Postal Webhook: Unhandled event type {$event}");
                break;
        }

        return response()->json(['status' => 'success']);
    }
}
