<?php

namespace App\Events\Campaign;

use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class RVMDropQueued
{
    use Dispatchable, SerializesModels;

    public function __construct(public int $rvmDropId, public int $smbId)
    {
    }
}



