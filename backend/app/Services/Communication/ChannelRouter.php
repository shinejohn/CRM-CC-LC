<?php

namespace App\Services\Communication;

use App\DTOs\Communication\MessageRequest;
use App\DTOs\Communication\RoutingDecision;
use App\Models\Communication\ChannelHealth;
use InvalidArgumentException;

class ChannelRouter
{
    public function __construct(
        private array $config = []
    ) {
        $this->config = config('communication', []);
    }

    public function route(MessageRequest $request): RoutingDecision
    {
        return match ($request->channel) {
            'email' => $this->routeEmail($request),
            'sms' => $this->routeSms($request),
            'push' => $this->routePush($request),
            default => throw new InvalidArgumentException("Unknown channel: {$request->channel}"),
        };
    }

    private function routeEmail(MessageRequest $request): RoutingDecision
    {
        // Determine IP pool based on message type
        $ipPool = $request->ipPool ?? match ($request->messageType) {
            'emergency' => 'emergency',
            'alert' => 'alerts',
            'newsletter' => 'newsletters',
            'campaign' => 'campaigns',
            'transactional' => 'transactional',
            default => 'default',
        };
        
        // Check gateway health, prefer Postal
        $postalHealthy = $this->isHealthy('email', 'postal');
        $sesHealthy = $this->isHealthy('email', 'ses');
        
        // For emergencies and transactional, always try both
        if (in_array($request->messageType, ['emergency', 'transactional'])) {
            $gateway = $postalHealthy ? 'postal' : ($sesHealthy ? 'ses' : 'postal');
        } else {
            // Prefer Postal for cost, fall back to SES
            $gateway = $postalHealthy ? 'postal' : 'ses';
        }
        
        return new RoutingDecision(
            gateway: $gateway,
            ipPool: $ipPool,
            failover: $gateway === 'postal' ? 'ses' : 'postal',
        );
    }

    private function routeSms(MessageRequest $request): RoutingDecision
    {
        return new RoutingDecision(
            gateway: 'twilio',
            failover: 'bandwidth',
        );
    }

    private function routePush(MessageRequest $request): RoutingDecision
    {
        return new RoutingDecision(
            gateway: 'firebase',
        );
    }

    private function isHealthy(string $channel, string $gateway): bool
    {
        $health = ChannelHealth::where('channel', $channel)
            ->where('gateway', $gateway)
            ->first();
        
        if (!$health) {
            return true; // Assume healthy if not checked yet
        }
        
        return $health->is_healthy;
    }
}
