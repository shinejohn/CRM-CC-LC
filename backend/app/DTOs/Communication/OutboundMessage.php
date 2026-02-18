<?php

namespace App\DTOs\Communication;

class OutboundMessage
{
    public function __construct(
        public string $to,
        public ?string $subject = null,
        public ?string $body = null,
        public ?string $bodyHtml = null,
        public array $metadata = [],
        public ?string $ipPool = null,
    ) {}
}
