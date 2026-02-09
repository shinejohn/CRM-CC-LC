<?php

namespace App\Events\Emergency;

use App\Models\Emergency\EmergencyBroadcast;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class EmergencyBroadcastSendStarted
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public EmergencyBroadcast $broadcast
    ) {}
}



