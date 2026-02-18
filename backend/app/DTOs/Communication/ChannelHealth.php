<?php

namespace App\DTOs\Communication;

class ChannelHealth
{
    public function __construct(
        public bool $isHealthy,
        public ?float $successRate1h = null,
        public ?float $successRate24h = null,
        public ?int $avgLatencyMs = null,
        public ?int $currentRatePerSec = null,
        public ?int $maxRatePerSec = null,
    ) {}
}
