<?php

namespace App\Events\SMB;

use App\Models\Customer;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class SMBCreated
{
    use Dispatchable, SerializesModels;

    public function __construct(public Customer $customer)
    {
    }
}

