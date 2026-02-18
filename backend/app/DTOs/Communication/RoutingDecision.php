<?php

namespace App\DTOs\Communication;

class RoutingDecision
{
    public function __construct(
        public string $gateway,
        public ?string $ipPool = null,
        public ?string $failover = null,
    ) {}
}
