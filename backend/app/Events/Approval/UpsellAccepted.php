<?php

namespace App\Events\Approval;

use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class UpsellAccepted
{
    use Dispatchable, SerializesModels;

    public function __construct(public int $approvalId, public string $upsellServiceType)
    {
    }
}



