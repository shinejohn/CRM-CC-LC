<?php

namespace App\Events\Campaign;

use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class EmailClicked
{
    use Dispatchable, SerializesModels;

    public function __construct(public int $campaignSendId, public int $smbId, public ?string $link = null)
    {
    }
}



