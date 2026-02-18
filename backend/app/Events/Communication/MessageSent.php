<?php

namespace App\Events\Communication;

use App\Models\Communication\MessageQueue;
use App\DTOs\Communication\SendResult;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageSent
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public MessageQueue $message,
        public SendResult $result
    ) {}
}
