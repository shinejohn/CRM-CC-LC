<?php

namespace App\Events\Campaign;

use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class EmailOpened
{
    use Dispatchable, SerializesModels;

    public function __construct(public int $campaignSendId, public int $smbId)
    {
    }
}



