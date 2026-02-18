<?php

namespace App\DTOs\Communication;

use Carbon\Carbon;

class BulkMessageRequest
{
    /**
     * @param array $recipients Array of ['address' => string, 'id' => int|null, 'type' => string|null, 'data' => array|null]
     */
    public function __construct(
        public string $channel,
        public string $priority,
        public string $messageType,
        public array $recipients,
        public ?string $template = null,
        public ?string $subject = null,
        public array $sharedData = [],
        public ?string $sourceType = null,
        public ?int $sourceId = null,
        public ?Carbon $scheduledFor = null,
        public ?string $ipPool = null,
    ) {}
}
