<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Communication\MessageQueue;
use App\Models\Communication\DeliveryEvent;
use App\Events\Communication\MessageDelivered;
use App\Events\Communication\MessageOpened;
use App\Events\Communication\MessageClicked;
use App\Events\Communication\MessageBounced;
use App\Events\Communication\MessageComplained;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class CommunicationWebhookController extends Controller
{
    public function postal(Request $request): JsonResponse
    {
        $payload = $request->all();
        
        // Postal webhook format
        $eventType = $payload['event'] ?? null;
        $messageId = $payload['message_id'] ?? null;
        
        if (!$messageId) {
            return response()->json(['error' => 'Missing message_id'], 400);
        }
        
        // Find message by external_id
        $message = MessageQueue::where('external_id', $messageId)
            ->orWhere('external_id', 'like', "%{$messageId}%")
            ->first();
        
        if (!$message) {
            Log::warning("Postal webhook: Message not found", ['message_id' => $messageId]);
            return response()->json(['error' => 'Message not found'], 404);
        }
        
        $this->processEvent($message, $eventType, $payload, 'postal');
        
        return response()->json(['success' => true]);
    }
    
    public function ses(Request $request): JsonResponse
    {
        // SES sends SNS notifications
        $payload = $request->all();
        
        if (isset($payload['Type']) && $payload['Type'] === 'Notification') {
            $message = json_decode($payload['Message'], true);
            $eventType = $message['eventType'] ?? null;
            $mail = $message['mail'] ?? [];
            $messageId = $mail['messageId'] ?? null;
            
            if (!$messageId) {
                return response()->json(['error' => 'Missing messageId'], 400);
            }
            
            $dbMessage = MessageQueue::where('external_id', $messageId)->first();
            
            if (!$dbMessage) {
                Log::warning("SES webhook: Message not found", ['message_id' => $messageId]);
                return response()->json(['error' => 'Message not found'], 404);
            }
            
            $this->processEvent($dbMessage, $eventType, $message, 'ses');
        }
        
        return response()->json(['success' => true]);
    }
    
    public function twilio(Request $request): JsonResponse
    {
        $payload = $request->all();
        $messageSid = $payload['MessageSid'] ?? null;
        $status = $payload['MessageStatus'] ?? null;
        
        if (!$messageSid) {
            return response()->json(['error' => 'Missing MessageSid'], 400);
        }
        
        $message = MessageQueue::where('external_id', $messageSid)->first();
        
        if (!$message) {
            Log::warning("Twilio webhook: Message not found", ['message_sid' => $messageSid]);
            return response()->json(['error' => 'Message not found'], 404);
        }
        
        $eventType = match ($status) {
            'delivered' => 'delivered',
            'failed' => 'bounced',
            'undelivered' => 'bounced',
            default => null,
        };
        
        if ($eventType) {
            $this->processEvent($message, $eventType, $payload, 'twilio');
        }
        
        return response()->json(['success' => true]);
    }
    
    public function firebase(Request $request): JsonResponse
    {
        $payload = $request->all();
        $messageId = $payload['message_id'] ?? null;
        $eventType = $payload['event_type'] ?? null;
        
        if (!$messageId) {
            return response()->json(['error' => 'Missing message_id'], 400);
        }
        
        $message = MessageQueue::where('external_id', $messageId)->first();
        
        if (!$message) {
            Log::warning("Firebase webhook: Message not found", ['message_id' => $messageId]);
            return response()->json(['error' => 'Message not found'], 404);
        }
        
        if ($eventType) {
            $this->processEvent($message, $eventType, $payload, 'firebase');
        }
        
        return response()->json(['success' => true]);
    }
    
    private function processEvent(MessageQueue $message, ?string $eventType, array $payload, string $source): void
    {
        if (!$eventType) {
            return;
        }
        
        // Create delivery event record
        DeliveryEvent::create([
            'message_queue_id' => $message->id,
            'event_type' => $eventType,
            'event_data' => $payload,
            'source' => $source,
            'external_event_id' => $payload['id'] ?? $payload['event_id'] ?? null,
        ]);
        
        // Update message status and emit events
        match ($eventType) {
            'delivered' => $this->handleDelivered($message),
            'opened' => $this->handleOpened($message),
            'clicked' => $this->handleClicked($message, $payload),
            'bounced' => $this->handleBounced($message, $payload),
            'complained' => $this->handleComplained($message),
            default => null,
        };
    }
    
    private function handleDelivered(MessageQueue $message): void
    {
        $message->update([
            'status' => 'delivered',
            'delivered_at' => now(),
        ]);
        
        event(new MessageDelivered($message));
    }
    
    private function handleOpened(MessageQueue $message): void
    {
        event(new MessageOpened($message));
    }
    
    private function handleClicked(MessageQueue $message, array $payload): void
    {
        $url = $payload['url'] ?? $payload['link'] ?? null;
        event(new MessageClicked($message, $url));
    }
    
    private function handleBounced(MessageQueue $message, array $payload): void
    {
        $bounceType = $payload['bounceType'] ?? $payload['bounce_type'] ?? 'soft';
        $hardBounce = $bounceType === 'hard' || $bounceType === 'Permanent';
        
        $message->update([
            'status' => 'bounced',
        ]);
        
        event(new MessageBounced($message, $hardBounce, $payload['reason'] ?? null));
    }
    
    private function handleComplained(MessageQueue $message): void
    {
        $message->update([
            'status' => 'complained',
        ]);
        
        event(new MessageComplained($message));
    }
}
