<?php

namespace App\Contracts\Communication;

use App\DTOs\Communication\OutboundMessage;
use App\DTOs\Communication\GatewayResult;
use App\DTOs\Communication\RateStatus;

interface GatewayInterface
{
    /**
     * Get gateway identifier
     */
    public function getName(): string;
    
    /**
     * Check if gateway is available
     */
    public function isAvailable(): bool;
    
    /**
     * Send single message
     */
    public function send(OutboundMessage $message): GatewayResult;
    
    /**
     * Send batch (if supported)
     */
    public function sendBatch(array $messages): array;
    
    /**
     * Get current rate limit status
     */
    public function getRateStatus(): RateStatus;
}
