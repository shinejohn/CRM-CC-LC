<?php

namespace App\Http\Controllers\Api\V1;

use App\Contracts\Communication\MessageServiceInterface;
use App\DTOs\Communication\MessageRequest;
use App\DTOs\Communication\BulkMessageRequest;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Carbon\Carbon;

class MessageController extends Controller
{
    public function __construct(
        private MessageServiceInterface $messageService
    ) {}
    
    public function send(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'channel' => 'required|in:email,sms,push',
            'priority' => 'required|in:P0,P1,P2,P3,P4',
            'message_type' => 'required|in:emergency,alert,newsletter,campaign,transactional',
            'recipient_address' => 'required|string',
            'recipient_id' => 'nullable|integer',
            'recipient_type' => 'nullable|string',
            'template' => 'nullable|string',
            'subject' => 'nullable|string',
            'body' => 'nullable|string',
            'data' => 'nullable|array',
            'source_type' => 'nullable|string',
            'source_id' => 'nullable|integer',
            'scheduled_for' => 'nullable|date',
            'ip_pool' => 'nullable|string',
        ]);
        
        $messageRequest = new MessageRequest(
            channel: $validated['channel'],
            priority: $validated['priority'],
            messageType: $validated['message_type'],
            recipientAddress: $validated['recipient_address'],
            recipientId: $validated['recipient_id'] ?? null,
            recipientType: $validated['recipient_type'] ?? null,
            template: $validated['template'] ?? null,
            subject: $validated['subject'] ?? null,
            body: $validated['body'] ?? null,
            data: $validated['data'] ?? [],
            sourceType: $validated['source_type'] ?? null,
            sourceId: $validated['source_id'] ?? null,
            scheduledFor: isset($validated['scheduled_for']) ? Carbon::parse($validated['scheduled_for']) : null,
            ipPool: $validated['ip_pool'] ?? null,
        );
        
        $result = $this->messageService->send($messageRequest);
        
        if ($result->success) {
            return response()->json([
                'success' => true,
                'uuid' => $result->uuid,
            ], 201);
        }
        
        return response()->json([
            'success' => false,
            'error' => $result->error,
            'reason' => $result->reason,
        ], 400);
    }
    
    public function sendBulk(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'channel' => 'required|in:email,sms,push',
            'priority' => 'required|in:P0,P1,P2,P3,P4',
            'message_type' => 'required|in:emergency,alert,newsletter,campaign,transactional',
            'recipients' => 'required|array|min:1',
            'recipients.*.address' => 'required|string',
            'recipients.*.id' => 'nullable|integer',
            'recipients.*.type' => 'nullable|string',
            'recipients.*.data' => 'nullable|array',
            'template' => 'nullable|string',
            'subject' => 'nullable|string',
            'shared_data' => 'nullable|array',
            'source_type' => 'nullable|string',
            'source_id' => 'nullable|integer',
            'scheduled_for' => 'nullable|date',
            'ip_pool' => 'nullable|string',
        ]);
        
        $bulkRequest = new BulkMessageRequest(
            channel: $validated['channel'],
            priority: $validated['priority'],
            messageType: $validated['message_type'],
            recipients: $validated['recipients'],
            template: $validated['template'] ?? null,
            subject: $validated['subject'] ?? null,
            sharedData: $validated['shared_data'] ?? [],
            sourceType: $validated['source_type'] ?? null,
            sourceId: $validated['source_id'] ?? null,
            scheduledFor: isset($validated['scheduled_for']) ? Carbon::parse($validated['scheduled_for']) : null,
            ipPool: $validated['ip_pool'] ?? null,
        );
        
        $result = $this->messageService->sendBulk($bulkRequest);
        
        return response()->json([
            'success' => true,
            'queued' => $result->queued,
            'suppressed' => $result->suppressed,
        ], 201);
    }
    
    public function status(string $uuid): JsonResponse
    {
        try {
            $status = $this->messageService->getStatus($uuid);
            
            return response()->json([
                'uuid' => $status->uuid,
                'status' => $status->status,
                'channel' => $status->channel,
                'priority' => $status->priority,
                'scheduled_for' => $status->scheduledFor?->toIso8601String(),
                'sent_at' => $status->sentAt?->toIso8601String(),
                'delivered_at' => $status->deliveredAt?->toIso8601String(),
                'external_id' => $status->externalId,
                'attempts' => $status->attempts,
                'last_error' => $status->lastError,
            ]);
        } catch (\InvalidArgumentException $e) {
            return response()->json([
                'error' => $e->getMessage(),
            ], 404);
        }
    }
    
    public function cancel(string $uuid): JsonResponse
    {
        $cancelled = $this->messageService->cancel($uuid);
        
        if ($cancelled) {
            return response()->json([
                'success' => true,
                'message' => 'Message cancelled',
            ]);
        }
        
        return response()->json([
            'success' => false,
            'error' => 'Message not found or cannot be cancelled',
        ], 404);
    }
    
    public function queueStats(): JsonResponse
    {
        $stats = \App\Models\Communication\MessageQueue::selectRaw('
                priority,
                status,
                COUNT(*) as count
            ')
            ->groupBy('priority', 'status')
            ->get()
            ->groupBy('priority')
            ->map(function ($group) {
                return $group->pluck('count', 'status');
            });
        
        return response()->json($stats);
    }
    
    public function channelStats(): JsonResponse
    {
        $stats = \App\Models\Communication\ChannelHealth::all();
        
        return response()->json($stats);
    }
}
