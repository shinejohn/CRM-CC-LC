<?php

namespace App\Events\SMB;

use App\Models\Customer;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class SMBEngagementChanged
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public Customer $customer,
        public int $oldScore,
        public int $newScore
    ) {
    }
}

