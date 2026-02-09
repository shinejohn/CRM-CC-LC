<?php

namespace App\Events\Alert;

use App\Models\Alert\AlertSend;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class AlertClicked
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public AlertSend $alertSend
    ) {}
}



