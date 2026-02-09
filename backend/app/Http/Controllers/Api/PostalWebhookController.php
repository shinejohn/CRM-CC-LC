<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CampaignRecipient;
use App\Models\EmailDeliveryEvent;
use App\Models\EmailSuppression;
use App\Events\EmailOpened;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PostalWebhookController extends Controller
{
    public function handle(Request $request): JsonResponse
    {
        if (!$this->verifySignature($request)) {
            return response()->json(['error' => 'Invalid signature'], 401);
        }

        $payload = $request->all();
        $event = $payload['event'] ?? null;
        $eventPayload = $payload['payload'] ?? [];
        $messageId = data_get($eventPayload, 'message.id')
            ?? data_get($eventPayload, 'message_id')
            ?? data_get($eventPayload, 'id');

        $recipient = $this->findRecipient($eventPayload, $messageId);

        EmailDeliveryEvent::create([
            'campaign_recipient_id' => $recipient?->id,
            'external_id' => $messageId,
            'event_type' => $event ?? 'unknown',
            'provider' => 'postal',
            'payload' => $eventPayload,
            'received_at' => now(),
        ]);

        if (!$recipient || !$event) {
            Log::warning('Postal webhook for unknown recipient', [
                'event' => $event,
                'message_id' => $messageId,
            ]);
            return response()->json(['status' => 'ok']);
        }

        $this->applyEvent($recipient, $event, $eventPayload, $messageId);

        return response()->json(['status' => 'ok']);
    }

    private function findRecipient(array $payload, ?string $messageId): ?CampaignRecipient
    {
        if ($messageId) {
            $recipient = CampaignRecipient::where('external_id', $messageId)->first();
            if ($recipient) {
                return $recipient;
            }
        }

        $recipientId = data_get($payload, 'message.headers.X-Fibonacco-Recipient-ID')
            ?? data_get($payload, 'headers.X-Fibonacco-Recipient-ID');
        $campaignId = data_get($payload, 'message.headers.X-Fibonacco-Campaign-ID')
            ?? data_get($payload, 'headers.X-Fibonacco-Campaign-ID');

        if ($recipientId && $campaignId) {
            $recipient = CampaignRecipient::where('campaign_id', $campaignId)
                ->where('id', $recipientId)
                ->first();
            if ($recipient) {
                return $recipient;
            }
        }

        if ($recipientId) {
            return CampaignRecipient::where('id', $recipientId)->first();
        }

        return null;
    }

    private function applyEvent(CampaignRecipient $recipient, string $event, array $payload, ?string $messageId): void
    {
        $campaign = $recipient->campaign;
        $now = now();
        $updates = [];

        switch ($event) {
            case 'MessageSent':
                if (!$recipient->sent_at) {
                    $updates['sent_at'] = $now;
                }
                if (!in_array($recipient->status, ['sent', 'delivered', 'opened', 'clicked', 'replied'])) {
                    $updates['status'] = 'sent';
                }
                break;
            case 'MessageDelivered':
                $shouldIncrement = $recipient->delivered_at === null;
                if ($shouldIncrement) {
                    $updates['delivered_at'] = $now;
                }
                if (!in_array($recipient->status, ['opened', 'clicked', 'replied'])) {
                    $updates['status'] = 'delivered';
                }
                if ($shouldIncrement) {
                    $campaign?->increment('delivered_count');
                }
                break;
            case 'MessageLoaded':
                $shouldIncrement = $recipient->opened_at === null;
                if ($shouldIncrement) {
                    $updates['opened_at'] = $now;
                }
                if (!in_array($recipient->status, ['clicked', 'replied'])) {
                    $updates['status'] = 'opened';
                }
                if ($shouldIncrement) {
                    $campaign?->increment('opened_count');
                    
                    // Fire EmailOpened event
                    if ($recipient->customer_id && $campaign) {
                        event(new EmailOpened(
                            customerId: $recipient->customer_id,
                            campaignId: $campaign->id,
                            messageId: $messageId
                        ));
                    }
                }
                break;
            case 'MessageLinkClicked':
                $shouldIncrementClick = $recipient->clicked_at === null;
                $shouldIncrementOpen = $recipient->opened_at === null;
                if ($shouldIncrementClick) {
                    $updates['clicked_at'] = $now;
                }
                if ($shouldIncrementOpen) {
                    $updates['opened_at'] = $now;
                }
                $updates['status'] = 'clicked';
                if ($shouldIncrementClick) {
                    $campaign?->increment('clicked_count');
                }
                if ($shouldIncrementOpen) {
                    $campaign?->increment('opened_count');
                }
                break;
            case 'MessageDeliveryFailed':
                if (!in_array($recipient->status, ['failed', 'bounced'])) {
                    $updates['status'] = 'failed';
                    $campaign?->increment('failed_count');
                }
                $updates['error_message'] = data_get($payload, 'details')
                    ?? data_get($payload, 'message')
                    ?? $recipient->error_message;
                break;
            case 'MessageBounced':
                if (!in_array($recipient->status, ['failed', 'bounced'])) {
                    $updates['status'] = 'bounced';
                    $campaign?->increment('failed_count');
                }
                $bounceType = data_get($payload, 'bounce.type') ?? 'unknown';
                $updates['error_message'] = 'Bounce: ' . $bounceType;
                $this->handleHardBounce($recipient, $bounceType, $messageId, $payload);
                break;
            case 'MessageHeld':
                if (!in_array($recipient->status, ['failed', 'bounced'])) {
                    $updates['status'] = 'failed';
                    $campaign?->increment('failed_count');
                }
                $updates['error_message'] = data_get($payload, 'details')
                    ?? 'Message held';
                break;
            default:
                return;
        }

        if (!empty($updates)) {
            $recipient->update($updates);
        }
    }

    private function handleHardBounce(
        CampaignRecipient $recipient,
        string $bounceType,
        ?string $messageId,
        array $payload
    ): void {
        if ($bounceType !== 'HardFail' || !$recipient->email) {
            return;
        }

        EmailSuppression::updateOrCreate(
            ['email' => $recipient->email],
            [
                'reason' => 'bounce_hard',
                'provider' => 'postal',
                'source' => 'postal_webhook',
                'metadata' => [
                    'bounce_type' => $bounceType,
                    'message_id' => $messageId,
                    'payload_id' => data_get($payload, 'id'),
                ],
            ]
        );
    }

    private function verifySignature(Request $request): bool
    {
        $secret = config('services.postal.webhook_secret');
        $signature = $request->header('X-Postal-Signature');
        $payload = $request->getContent();

        if (!$secret || !$signature) {
            Log::warning('Postal webhook signature missing');
            return false;
        }

        $expected = base64_encode(hash_hmac('sha1', $payload, $secret, true));

        return hash_equals($expected, $signature);
    }
}



