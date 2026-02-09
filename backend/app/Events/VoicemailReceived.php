<?php

namespace App\Events;

use App\Models\Customer;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class VoicemailReceived
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public Customer $customer,
        public string $fromNumber,
        public string $recordingUrl,
        public ?string $transcription = null,
        public ?int $durationSeconds = null,
        public ?string $urgency = null // low, medium, high
    ) {}
}

