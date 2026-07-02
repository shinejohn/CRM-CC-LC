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

final class SendEmergencyPush implements ShouldQueue
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
        
        // Filter to recipients with device tokens
        $pushRecipients = collect($this->recipients)
            ->filter(fn($r) => !empty($r['device_tokens']) && is_array($r['device_tokens']))
            ->toArray();
        
        $totalTokens = collect($pushRecipients)->sum(fn($r) => count($r['device_tokens']));
        $broadcast->update(['push_queued' => $totalTokens]);

        // Push delivery is not implemented yet (no FCM / APNs integration).
        // Do NOT increment push_sent here — that must reflect real deliveries only.
        // Device tokens remain counted in push_queued as un-sent.
        Log::warning('Emergency push delivery not implemented — tokens queued but not sent', [
            'broadcast_id' => $broadcast->id,
            'push_queued' => $totalTokens,
        ]);
    }
}



