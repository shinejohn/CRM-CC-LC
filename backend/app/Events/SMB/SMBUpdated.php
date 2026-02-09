<?php

namespace App\Events\SMB;

use App\Models\Customer;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class SMBUpdated
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public Customer $customer,
        public array $changedFields
    ) {
    }
}

