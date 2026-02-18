<?php

namespace App\Events\Communication;

use App\Models\Communication\MessageQueue;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageClicked
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public MessageQueue $message,
        public ?string $url = null
    ) {}
}
