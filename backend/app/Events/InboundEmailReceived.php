<?php

namespace App\Events;

use App\Models\Customer;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class InboundEmailReceived
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public Customer $customer,
        public string $fromEmail,
        public string $subject,
        public string $body,
        public ?string $messageId = null,
        public ?string $inReplyTo = null,
        public ?string $sentiment = null,
        public ?string $classifiedIntent = null
    ) {}
}

