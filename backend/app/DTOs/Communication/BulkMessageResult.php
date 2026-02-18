<?php

namespace App\DTOs\Communication;

class BulkMessageResult
{
    public function __construct(
        public int $queued,
        public int $suppressed,
        public ?string $sourceType = null,
        public ?int $sourceId = null,
    ) {}
}
