<?php

namespace App\Events\Approval;

use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class UpsellOffered
{
    use Dispatchable, SerializesModels;

    public function __construct(public string $approvalId, public string $upsellServiceType)
    {
    }
}



