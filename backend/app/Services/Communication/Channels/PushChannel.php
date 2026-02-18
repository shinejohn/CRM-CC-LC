<?php

namespace App\Services\Communication\Channels;

use App\Contracts\Communication\ChannelInterface;
use App\Contracts\Communication\GatewayInterface;
use App\Models\Communication\MessageQueue;
use App\DTOs\Communication\SendResult;
use App\DTOs\Communication\ChannelHealth;
use App\Services\Communication\Gateways\FCMGateway;

class PushChannel implements ChannelInterface
{
    private ?GatewayInterface $gateway = null;

    public function __construct(
        private FCMGateway $fcmGateway,
    ) {}
    
    public function setGateway(string $gatewayName): self
    {
        $this->gateway = match ($gatewayName) {
            'firebase', 'fcm' => $this->fcmGateway,
            default => throw new \InvalidArgumentException("Unknown push gateway: {$gatewayName}"),
        };
        
        return $this;
    }
    
    public function getName(): string
    {
        return 'push';
    }
    
    public function canSend(string $address): bool
    {
        return !empty($address); // Device tokens can be any string
    }
    
    public function send(MessageQueue $message): SendResult
    {
        if (!$this->gateway) {
            $this->setGateway('firebase'); // Default
        }
        
        if (!$this->gateway->isAvailable()) {
            return new SendResult(success: false, error: 'Push gateway not available');
        }
        
        $outboundMessage = new \App\DTOs\Communication\OutboundMessage(
            to: $message->recipient_address,
            subject: $message->subject,
            body: $message->content_data['body'] ?? null,
            metadata: $message->content_data['metadata'] ?? [],
        );
        
        $result = $this->gateway->send($outboundMessage);
        
        return new SendResult(
            success: $result->success,
            externalId: $result->externalId,
            error: $result->error,
        );
    }
    
    public function sendBulk(array $messages): array
    {
        // FCM supports batch sending
        if ($this->gateway && method_exists($this->gateway, 'sendBatch')) {
            $outboundMessages = array_map(function ($message) {
                return new \App\DTOs\Communication\OutboundMessage(
                    to: $message->recipient_address,
                    subject: $message->subject,
                    body: $message->content_data['body'] ?? null,
                    metadata: $message->content_data['metadata'] ?? [],
                );
            }, $messages);
            
            return $this->gateway->sendBatch($outboundMessages);
        }
        
        // Fallback to individual sends
        $results = [];
        foreach ($messages as $message) {
            $results[] = $this->send($message);
        }
        
        return $results;
    }
    
    public function getHealth(): ChannelHealth
    {
        $health = \App\Models\Communication\ChannelHealth::where('channel', 'push')
            ->where('gateway', 'firebase')
            ->first();
        
        return new ChannelHealth(
            isHealthy: $health?->is_healthy ?? true,
            successRate1h: $health?->success_rate_1h,
            successRate24h: $health?->success_rate_24h,
            avgLatencyMs: $health?->avg_latency_ms,
        );
    }
}
