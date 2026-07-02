<?php

declare(strict_types=1);

namespace App\Jobs\Emergency;

use App\Models\Emergency\EmergencyBroadcast;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

final class SendEmergencyVoice implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $queue = 'emergency';
    public $timeout = 600;
    public $tries = 1;
    
    public function __construct(
        private string $broadcastId,
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

        // Voice delivery is not implemented yet (no Twilio Voice / TTS integration).
        // Do NOT increment voice_sent / voice_answered here — those must reflect real
        // deliveries only. Recipients remain counted in voice_queued as un-sent.
        Log::warning('Emergency voice delivery not implemented — recipients queued but not sent', [
            'broadcast_id' => $broadcast->id,
            'voice_queued' => count($voiceRecipients),
        ]);
    }
}



