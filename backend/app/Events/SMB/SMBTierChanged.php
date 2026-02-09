<?php

namespace App\Events\SMB;

use App\Models\Customer;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class SMBTierChanged
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public Customer $customer,
        public int $oldTier,
        public int $newTier,
        public string $direction // 'upgrade' or 'downgrade'
    ) {
    }
}

