<?php

namespace App\Services\Communication\Channels;

use App\Contracts\Communication\ChannelInterface;
use App\Contracts\Communication\GatewayInterface;
use App\Models\Communication\MessageQueue;
use App\DTOs\Communication\SendResult;
use App\DTOs\Communication\ChannelHealth;
use App\Services\Communication\Gateways\TwilioGateway;

class SmsChannel implements ChannelInterface
{
    private ?GatewayInterface $gateway = null;

    public function __construct(
        private TwilioGateway $twilioGateway,
    ) {}
    
    public function setGateway(string $gatewayName): self
    {
        $this->gateway = match ($gatewayName) {
            'twilio' => $this->twilioGateway,
            default => throw new \InvalidArgumentException("Unknown SMS gateway: {$gatewayName}"),
        };
        
        return $this;
    }
    
    public function getName(): string
    {
        return 'sms';
    }
    
    public function canSend(string $address): bool
    {
        return preg_match('/^\+?[1-9]\d{1,14}$/', $address) === 1;
    }
    
    public function send(MessageQueue $message): SendResult
    {
        if (!$this->gateway) {
            $this->setGateway('twilio'); // Default
        }
        
        if (!$this->gateway->isAvailable()) {
            return new SendResult(success: false, error: 'SMS gateway not available');
        }
        
        $outboundMessage = new \App\DTOs\Communication\OutboundMessage(
            to: $message->recipient_address,
            body: $message->content_data['body'] ?? $message->subject,
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
        $results = [];
        
        foreach ($messages as $message) {
            $results[] = $this->send($message);
        }
        
        return $results;
    }
    
    public function getHealth(): ChannelHealth
    {
        $health = \App\Models\Communication\ChannelHealth::where('channel', 'sms')
            ->where('gateway', 'twilio')
            ->first();
        
        return new ChannelHealth(
            isHealthy: $health?->is_healthy ?? true,
            successRate1h: $health?->success_rate_1h,
            successRate24h: $health?->success_rate_24h,
            avgLatencyMs: $health?->avg_latency_ms,
        );
    }
}
