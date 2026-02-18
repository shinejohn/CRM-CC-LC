<?php

namespace App\Services\Communication\Channels;

use App\Contracts\Communication\ChannelInterface;
use App\Contracts\Communication\GatewayInterface;
use App\Models\Communication\MessageQueue;
use App\DTOs\Communication\SendResult;
use App\DTOs\Communication\ChannelHealth;
use App\Services\Communication\Gateways\PostalGateway;
use App\Services\Communication\Gateways\SesGateway;

class EmailChannel implements ChannelInterface
{
    private ?GatewayInterface $gateway = null;

    public function __construct(
        private PostalGateway $postalGateway,
        private SesGateway $sesGateway,
    ) {}
    
    public function setGateway(string $gatewayName): self
    {
        $this->gateway = match ($gatewayName) {
            'postal' => $this->postalGateway,
            'ses' => $this->sesGateway,
            default => throw new \InvalidArgumentException("Unknown email gateway: {$gatewayName}"),
        };
        
        return $this;
    }
    
    public function getName(): string
    {
        return 'email';
    }
    
    public function canSend(string $address): bool
    {
        return filter_var($address, FILTER_VALIDATE_EMAIL) !== false;
    }
    
    public function send(MessageQueue $message): SendResult
    {
        if (!$this->gateway) {
            $this->setGateway('postal'); // Default
        }
        
        if (!$this->gateway->isAvailable()) {
            // Try failover
            $failover = $this->gateway === $this->postalGateway ? $this->sesGateway : $this->postalGateway;
            if ($failover->isAvailable()) {
                $this->gateway = $failover;
            } else {
                return new SendResult(success: false, error: 'No available email gateway');
            }
        }
        
        $outboundMessage = new \App\DTOs\Communication\OutboundMessage(
            to: $message->recipient_address,
            subject: $message->subject,
            bodyHtml: $message->content_data['body_html'] ?? null,
            body: $message->content_data['body'] ?? null,
            metadata: $message->content_data['metadata'] ?? [],
            ipPool: $message->ip_pool,
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
        $results = [];
        
        foreach ($messages as $message) {
            $results[] = $this->send($message);
        }
        
        return $results;
    }
    
    public function getHealth(): ChannelHealth
    {
        // Get health from database
        $postalHealth = \App\Models\Communication\ChannelHealth::where('channel', 'email')
            ->where('gateway', 'postal')
            ->first();
        
        $sesHealth = \App\Models\Communication\ChannelHealth::where('channel', 'email')
            ->where('gateway', 'ses')
            ->first();
        
        $isHealthy = ($postalHealth?->is_healthy ?? true) || ($sesHealth?->is_healthy ?? true);
        
        return new ChannelHealth(
            isHealthy: $isHealthy,
            successRate1h: $postalHealth?->success_rate_1h,
            successRate24h: $postalHealth?->success_rate_24h,
            avgLatencyMs: $postalHealth?->avg_latency_ms,
        );
    }
}
