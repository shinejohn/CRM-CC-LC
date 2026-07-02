<?php

namespace App\Contracts\Emergency;

use App\Models\Emergency\EmergencyBroadcast;

interface EmergencyBroadcastServiceInterface
{
    /**
     * Create emergency broadcast (requires authorization)
     */
    public function create(array $data, string $authorizationPin): EmergencyBroadcast;
    
    /**
     * Send broadcast immediately (P0 priority)
     */
    public function send(string $broadcastId): array;
    
    /**
     * Cancel broadcast (if not yet sent)
     */
    public function cancel(string $broadcastId, string $reason): bool;
    
    /**
     * Get real-time delivery status
     */
    public function getDeliveryStatus(string $broadcastId): array;
    
    /**
     * Send test broadcast (limited recipients)
     */
    public function sendTest(string $broadcastId, array $testRecipients): array;
}



