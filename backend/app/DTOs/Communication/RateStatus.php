<?php

namespace App\DTOs\Communication;

class RateStatus
{
    public function __construct(
        public int $currentPerSecond,
        public int $maxPerSecond,
        public int $currentPerHour,
        public int $maxPerHour,
        public bool $canSend = true,
    ) {}
}
