<?php

namespace App\Events\Communication;

use App\Models\Communication\MessageQueue;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageBounced
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public MessageQueue $message,
        public bool $hardBounce = false,
        public ?string $reason = null
    ) {}
}
