<?php

namespace App\Jobs\Emergency;

use App\Models\Emergency\EmergencyBroadcast;
use App\Services\SMSService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class SendEmergencySms implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $queue = 'emergency';
    public $timeout = 600;
    public $tries = 1;
    
    public function __construct(
        private int $broadcastId,
        private array $recipients,
    ) {}
    
    public function handle(SMSService $smsService)
    {
        $broadcast = EmergencyBroadcast::find($this->broadcastId);
        
        if (!$broadcast) {
            Log::error('Emergency broadcast not found', ['broadcast_id' => $this->broadcastId]);
            return;
        }
        
        // Filter to recipients with phone
        $smsRecipients = collect($this->recipients)
            ->filter(fn($r) => !empty($r['phone']))
            ->toArray();
        
        $broadcast->update(['sms_queued' => count($smsRecipients)]);
        
        // Build SMS message (max 160 chars for reliability)
        $message = $this->buildSmsMessage($broadcast);
        
        $sent = 0;
        $failed = 0;
        
        // Send via SMSService - P0 PRIORITY
        foreach ($smsRecipients as $recipient) {
            try {
                $result = $smsService->send(
                    $recipient['phone'],
                    $message,
                    [
                        'emergency_broadcast_id' => $broadcast->id,
                        'recipient_id' => $recipient['id'],
                        'priority' => 'P0',
                    ]
                );
                
                if ($result && ($result['success'] ?? false)) {
                    $sent++;
                } else {
                    $failed++;
                }
            } catch (\Exception $e) {
                Log::error('Failed to send emergency SMS', [
                    'broadcast_id' => $broadcast->id,
                    'recipient_id' => $recipient['id'],
                    'error' => $e->getMessage(),
                ]);
                $failed++;
            }
        }
        
        $broadcast->increment('sms_sent', $sent);
    }
    
    private function buildSmsMessage(EmergencyBroadcast $broadcast): string
    {
        // SMS must be concise
        $prefix = strtoupper($broadcast->category);
        $message = "{$prefix}: {$broadcast->title}. ";
        
        if ($broadcast->instructions) {
            $message .= Str::limit($broadcast->instructions, 80);
        } else {
            $message .= Str::limit($broadcast->message, 80);
        }
        
        // Don't exceed 160 chars
        return Str::limit($message, 160);
    }
}



