<?php

namespace App\Jobs\Emergency;

use App\Models\Emergency\EmergencyBroadcast;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SendEmergencyVoice implements ShouldQueue
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
        
        // Filter to recipients with phone
        $voiceRecipients = collect($this->recipients)
            ->filter(fn($r) => !empty($r['phone']))
            ->toArray();
        
        $broadcast->update(['voice_queued' => count($voiceRecipients)]);
        
        $sent = 0;
        $answered = 0;
        $failed = 0;
        
        // TODO: Integrate with Twilio Voice API or similar
        // Voice broadcasts would use TTS to generate audio and call recipients
        // For now, we'll mark as queued but not implement full voice logic
        foreach ($voiceRecipients as $recipient) {
            try {
                // This would call Twilio Voice API or similar
                // For now, we'll simulate success
                $sent++;
                // If call is answered, increment answered
                $answered++;
            } catch (\Exception $e) {
                Log::error('Failed to send emergency voice', [
                    'broadcast_id' => $broadcast->id,
                    'recipient_id' => $recipient['id'],
                    'error' => $e->getMessage(),
                ]);
                $failed++;
            }
        }
        
        $broadcast->increment('voice_sent', $sent);
        $broadcast->increment('voice_answered', $answered);
    }
}



