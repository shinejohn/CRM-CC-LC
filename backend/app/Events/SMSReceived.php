<?php

namespace App\Events;

use App\Models\Customer;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class SMSReceived
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public Customer $customer,
        public string $fromNumber,
        public string $message,
        public ?string $classifiedIntent = null,
        public ?float $intentConfidence = null,
        public ?string $sentiment = null
    ) {}
}

