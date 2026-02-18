<?php

namespace App\DTOs\Communication;

class MessageStatus
{
    public function __construct(
        public string $uuid,
        public string $status, // pending, processing, sent, delivered, failed, bounced
        public ?string $channel = null,
        public ?string $priority = null,
        public ?\Carbon\Carbon $scheduledFor = null,
        public ?\Carbon\Carbon $sentAt = null,
        public ?\Carbon\Carbon $deliveredAt = null,
        public ?string $externalId = null,
        public int $attempts = 0,
        public ?string $lastError = null,
    ) {}
}
