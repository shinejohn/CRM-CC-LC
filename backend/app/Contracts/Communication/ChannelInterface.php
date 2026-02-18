<?php

namespace App\Contracts\Communication;

use App\Models\Communication\MessageQueue;
use App\DTOs\Communication\SendResult;
use App\DTOs\Communication\ChannelHealth;

interface ChannelInterface
{
    /**
     * Get channel name
     */
    public function getName(): string;
    
    /**
     * Check if channel can send to address
     */
    public function canSend(string $address): bool;
    
    /**
     * Send message through this channel
     */
    public function send(MessageQueue $message): SendResult;
    
    /**
     * Send bulk through this channel
     */
    public function sendBulk(array $messages): array;
    
    /**
     * Get current health status
     */
    public function getHealth(): ChannelHealth;
}
