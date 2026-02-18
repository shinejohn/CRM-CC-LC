<?php

namespace App\Jobs\Communication;

use App\Models\Communication\MessageQueue;
use App\Models\Communication\DeliveryEvent;
use App\Services\Communication\SuppressionService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class ProcessSuppressions implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle(SuppressionService $suppressionService): void
    
    public function handle(): void
    {
        // Process hard bounces
        $hardBounces = DeliveryEvent::where('event_type', 'bounced')
            ->where('event_data->bounceType', 'hard')
            ->whereDoesntHave('messageQueue', function ($query) {
                $query->whereHas('deliveryEvents', function ($q) {
                    $q->where('event_type', 'suppressed');
                });
            })
            ->with('messageQueue')
            ->get();
        
        foreach ($hardBounces as $event) {
            $suppressionService->addSuppression(
                channel: $event->messageQueue->channel,
                address: $event->messageQueue->recipient_address,
                reason: 'bounce_hard',
                source: 'webhook',
            );
        }
        
        // Process complaints
        $complaints = DeliveryEvent::where('event_type', 'complained')
            ->whereDoesntHave('messageQueue', function ($query) {
                $query->whereHas('deliveryEvents', function ($q) {
                    $q->where('event_type', 'suppressed');
                });
            })
            ->with('messageQueue')
            ->get();
        
        foreach ($complaints as $event) {
            $suppressionService->addSuppression(
                channel: $event->messageQueue->channel,
                address: $event->messageQueue->recipient_address,
                reason: 'complaint',
                source: 'webhook',
            );
        }
        
        // Process soft bounces (after threshold)
        $softBounceCounts = DeliveryEvent::where('event_type', 'bounced')
            ->where('event_data->bounceType', 'soft')
            ->with('messageQueue')
            ->get()
            ->groupBy('messageQueue.recipient_address')
            ->map->count();
        
        foreach ($softBounceCounts as $address => $count) {
            if ($count >= 3) {
                $firstEvent = DeliveryEvent::where('event_type', 'bounced')
                    ->whereHas('messageQueue', function ($query) use ($address) {
                        $query->where('recipient_address', $address);
                    })
                    ->first();
                
                if ($firstEvent) {
                    $suppressionService->addSuppression(
                        channel: $firstEvent->messageQueue->channel,
                        address: $address,
                        reason: 'bounce_soft',
                        source: 'webhook',
                    );
                }
            }
        }
    }
}
