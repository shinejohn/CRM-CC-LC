<?php

namespace App\Jobs\Communication;

use App\Models\Communication\ChannelHealth;
use App\Models\Communication\MessageQueue;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;

class UpdateChannelHealth implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle(): void
    {
        $channels = [
            ['channel' => 'email', 'gateway' => 'postal'],
            ['channel' => 'email', 'gateway' => 'ses'],
            ['channel' => 'sms', 'gateway' => 'twilio'],
            ['channel' => 'push', 'gateway' => 'firebase'],
        ];
        
        foreach ($channels as $config) {
            $this->updateHealth($config['channel'], $config['gateway']);
        }
    }
    
    private function updateHealth(string $channel, string $gateway): void
    {
        $oneHourAgo = now()->subHour();
        $twentyFourHoursAgo = now()->subDay();
        
        // Calculate success rates
        $total1h = MessageQueue::where('channel', $channel)
            ->where('gateway', $gateway)
            ->where('sent_at', '>=', $oneHourAgo)
            ->count();
        
        $success1h = MessageQueue::where('channel', $channel)
            ->where('gateway', $gateway)
            ->where('sent_at', '>=', $oneHourAgo)
            ->whereIn('status', ['sent', 'delivered'])
            ->count();
        
        $total24h = MessageQueue::where('channel', $channel)
            ->where('gateway', $gateway)
            ->where('sent_at', '>=', $twentyFourHoursAgo)
            ->count();
        
        $success24h = MessageQueue::where('channel', $channel)
            ->where('gateway', $gateway)
            ->where('sent_at', '>=', $twentyFourHoursAgo)
            ->whereIn('status', ['sent', 'delivered'])
            ->count();
        
        $successRate1h = $total1h > 0 ? ($success1h / $total1h) * 100 : null;
        $successRate24h = $total24h > 0 ? ($success24h / $total24h) * 100 : null;
        
        // Calculate average latency (simplified)
        $avgLatency = MessageQueue::where('channel', $channel)
            ->where('gateway', $gateway)
            ->where('sent_at', '>=', $oneHourAgo)
            ->whereNotNull('sent_at')
            ->whereNotNull('delivered_at')
            ->selectRaw('AVG(EXTRACT(EPOCH FROM (delivered_at - sent_at)) * 1000) as avg_ms')
            ->value('avg_ms');
        
        $isHealthy = ($successRate1h ?? 100) >= 95 && ($successRate24h ?? 100) >= 95;
        
        ChannelHealth::updateOrCreate(
            [
                'channel' => $channel,
                'gateway' => $gateway,
            ],
            [
                'is_healthy' => $isHealthy,
                'success_rate_1h' => $successRate1h,
                'success_rate_24h' => $successRate24h,
                'avg_latency_ms' => $avgLatency ? (int) $avgLatency : null,
                'last_check_at' => now(),
            ]
        );
    }
}
