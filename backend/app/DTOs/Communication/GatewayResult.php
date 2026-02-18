<?php

namespace App\DTOs\Communication;

class GatewayResult
{
    public function __construct(
        public bool $success,
        public ?string $externalId = null,
        public ?string $error = null,
        public ?int $statusCode = null,
    ) {}
}
