<?php

namespace App\Jobs\Emergency;

use App\Models\Emergency\EmergencyBroadcast;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SendEmergencyPush implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $queue = 'emergency';
    public $timeout = 600;
    public $tries = 1;
    
    public function __construct(
        private int $broadcastId,
        private array $recipients,
    ) {}
    
    public function handle()
    {
        $broadcast = EmergencyBroadcast::find($this->broadcastId);
        
        if (!$broadcast) {
            Log::error('Emergency broadcast not found', ['broadcast_id' => $this->broadcastId]);
            return;
        }
        
        // Filter to recipients with device tokens
        $pushRecipients = collect($this->recipients)
            ->filter(fn($r) => !empty($r['device_tokens']) && is_array($r['device_tokens']))
            ->toArray();
        
        $totalTokens = collect($pushRecipients)->sum(fn($r) => count($r['device_tokens']));
        $broadcast->update(['push_queued' => $totalTokens]);
        
        $sent = 0;
        $failed = 0;
        
        // TODO: Integrate with Firebase Cloud Messaging (FCM) or Apple Push Notification Service (APNs)
        // For now, we'll mark as queued but not implement full push logic
        foreach ($pushRecipients as $recipient) {
            foreach ($recipient['device_tokens'] as $token) {
                try {
                    // This would call FCM/APNs API
                    // For now, we'll simulate success
                    $sent++;
                } catch (\Exception $e) {
                    Log::error('Failed to send emergency push', [
                        'broadcast_id' => $broadcast->id,
                        'recipient_id' => $recipient['id'],
                        'token' => $token,
                        'error' => $e->getMessage(),
                    ]);
                    $failed++;
                }
            }
        }
        
        $broadcast->increment('push_sent', $sent);
    }
}



