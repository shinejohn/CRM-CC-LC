<?php

namespace App\Events\Inbound;

use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ChatMessageReceived
{
    use Dispatchable, SerializesModels;

    public function __construct(public string $sessionId, public ?int $smbId, public string $message)
    {
    }
}



