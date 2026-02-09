<?php

namespace App\Events;

use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class EmailClicked
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public string $customerId,
        public string $campaignId,
        public ?string $messageId = null,
        public ?string $linkUrl = null
    ) {
    }
}
