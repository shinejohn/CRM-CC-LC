<?php

namespace App\DTOs\Communication;

use Carbon\Carbon;

class MessageRequest
{
    public function __construct(
        public string $channel,           // email, sms, push
        public string $priority,          // P0, P1, P2, P3, P4
        public string $messageType,       // emergency, alert, newsletter, campaign, transactional
        public string $recipientAddress,  // email, phone, or device token
        public ?int $recipientId = null,
        public ?string $recipientType = null,  // subscriber, smb
        public ?string $template = null,
        public ?string $subject = null,
        public ?string $body = null,
        public array $data = [],          // Template variables
        public ?string $sourceType = null,
        public ?int $sourceId = null,
        public ?Carbon $scheduledFor = null,
        public ?string $ipPool = null,    // Override default pool
    ) {}
}
