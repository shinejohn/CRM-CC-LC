<?php

namespace App\Events\Inbound;

use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class CallbackReceived
{
    use Dispatchable, SerializesModels;

    public function __construct(public int $callbackId, public ?int $smbId = null)
    {
    }
}



