<?php

namespace App\Services\Communication;

use App\Contracts\Communication\MessageServiceInterface;
use App\DTOs\Communication\MessageRequest;
use App\DTOs\Communication\BulkMessageRequest;
use App\DTOs\Communication\MessageResult;
use App\DTOs\Communication\BulkMessageResult;
use App\DTOs\Communication\MessageStatus;
use App\Models\Communication\MessageQueue;
use App\Events\Communication\MessageQueued;
use App\Jobs\Communication\ProcessMessage;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class MessageService implements MessageServiceInterface
{
    public function __construct(
        private SuppressionService $suppression,
        private RateLimitService $rateLimiter,
        private ChannelRouter $router,
    ) {}
    
    public function send(MessageRequest $request): MessageResult
    {
        // 1. Check suppression list
        if ($this->suppression->isSuppressed($request->channel, $request->recipientAddress)) {
            return MessageResult::suppressed('Address is on suppression list');
        }
        
        // 2. Validate address format
        if (!$this->validateAddress($request->channel, $request->recipientAddress)) {
            return MessageResult::invalid('Invalid address format');
        }
        
        // 3. Determine routing
        $routing = $this->router->route($request);
        
        // 4. Create queue entry
        $message = MessageQueue::create([
            'uuid' => Str::uuid()->toString(),
            'priority' => $request->priority,
            'message_type' => $request->messageType,
            'channel' => $request->channel,
            'recipient_type' => $request->recipientType,
            'recipient_id' => $request->recipientId,
            'recipient_address' => $request->recipientAddress,
            'subject' => $request->subject,
            'template' => $request->template,
            'content_data' => $request->data,
            'source_type' => $request->sourceType,
            'source_id' => $request->sourceId,
            'ip_pool' => $routing->ipPool,
            'gateway' => $routing->gateway,
            'scheduled_for' => $request->scheduledFor ?? now(),
        ]);
        
        // 5. Emit event
        event(new MessageQueued($message));
        
        // 6. For P0 messages, dispatch immediately
        if ($request->priority === 'P0') {
            dispatch(new ProcessMessage($message->id))->onQueue('messages-p0');
        }
        
        return MessageResult::queued($message->uuid);
    }
    
    public function sendBulk(BulkMessageRequest $request): BulkMessageResult
    {
        // For large bulk sends (newsletters, alerts), we use batching
        $recipients = $request->recipients;
        $batchSize = 1000;
        $totalQueued = 0;
        $suppressed = 0;
        
        // Determine routing once for all recipients
        $sampleRequest = new MessageRequest(
            channel: $request->channel,
            priority: $request->priority,
            messageType: $request->messageType,
            recipientAddress: 'sample@example.com', // Dummy for routing
        );
        $routing = $this->router->route($sampleRequest);
        
        foreach (array_chunk($recipients, $batchSize) as $batch) {
            $rows = [];
            
            foreach ($batch as $recipient) {
                $address = $recipient['address'] ?? null;
                if (!$address) {
                    continue;
                }
                
                if ($this->suppression->isSuppressed($request->channel, $address)) {
                    $suppressed++;
                    continue;
                }
                
                if (!$this->validateAddress($request->channel, $address)) {
                    $suppressed++;
                    continue;
                }
                
                $rows[] = [
                    'uuid' => Str::uuid()->toString(),
                    'priority' => $request->priority,
                    'message_type' => $request->messageType,
                    'channel' => $request->channel,
                    'recipient_type' => $recipient['type'] ?? 'subscriber',
                    'recipient_id' => $recipient['id'] ?? null,
                    'recipient_address' => $address,
                    'subject' => $request->subject,
                    'template' => $request->template,
                    'content_data' => json_encode(array_merge(
                        $request->sharedData,
                        $recipient['data'] ?? []
                    )),
                    'source_type' => $request->sourceType,
                    'source_id' => $request->sourceId,
                    'ip_pool' => $routing->ipPool,
                    'gateway' => $routing->gateway,
                    'scheduled_for' => $request->scheduledFor ?? now(),
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
            
            if (!empty($rows)) {
                DB::table('message_queue')->insert($rows);
                $totalQueued += count($rows);
            }
        }
        
        return new BulkMessageResult(
            queued: $totalQueued,
            suppressed: $suppressed,
            sourceType: $request->sourceType,
            sourceId: $request->sourceId,
        );
    }
    
    public function getStatus(string $uuid): MessageStatus
    {
        $message = MessageQueue::where('uuid', $uuid)->first();
        
        if (!$message) {
            throw new \InvalidArgumentException("Message not found: {$uuid}");
        }
        
        return new MessageStatus(
            uuid: $message->uuid,
            status: $message->status,
            channel: $message->channel,
            priority: $message->priority,
            scheduledFor: $message->scheduled_for,
            sentAt: $message->sent_at,
            deliveredAt: $message->delivered_at,
            externalId: $message->external_id,
            attempts: $message->attempts,
            lastError: $message->last_error,
        );
    }
    
    public function cancel(string $uuid): bool
    {
        $message = MessageQueue::where('uuid', $uuid)
            ->whereIn('status', ['pending', 'processing'])
            ->first();
        
        if (!$message) {
            return false;
        }
        
        $message->update([
            'status' => 'failed',
            'last_error' => 'Cancelled by user',
        ]);
        
        return true;
    }
    
    private function validateAddress(string $channel, string $address): bool
    {
        return match ($channel) {
            'email' => filter_var($address, FILTER_VALIDATE_EMAIL) !== false,
            'sms' => preg_match('/^\+?[1-9]\d{1,14}$/', $address) === 1, // E.164 format
            'push' => !empty($address), // Device tokens can be any string
            default => false,
        };
    }
}
