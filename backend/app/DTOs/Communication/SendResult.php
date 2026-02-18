<?php

namespace App\DTOs\Communication;

class SendResult
{
    public function __construct(
        public bool $success,
        public ?string $externalId = null,
        public ?string $error = null,
    ) {}
}
