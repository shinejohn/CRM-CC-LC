<?php

namespace App\Events\Inbound;

use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class InboundEmailReceived
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public int $conversationId,
        public ?int $smbId,
        public string $intent
    ) {
    }
}



