<?php

namespace App\Contracts\Communication;

use App\DTOs\Communication\MessageRequest;
use App\DTOs\Communication\BulkMessageRequest;
use App\DTOs\Communication\MessageResult;
use App\DTOs\Communication\BulkMessageResult;
use App\DTOs\Communication\MessageStatus;

interface MessageServiceInterface
{
    /**
     * Send a single message
     */
    public function send(MessageRequest $request): MessageResult;
    
    /**
     * Send bulk messages (for newsletters, alerts)
     */
    public function sendBulk(BulkMessageRequest $request): BulkMessageResult;
    
    /**
     * Get message status
     */
    public function getStatus(string $uuid): MessageStatus;
    
    /**
     * Cancel a pending message
     */
    public function cancel(string $uuid): bool;
}
