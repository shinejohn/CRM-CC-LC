<?php

namespace App\Listeners;

use App\Events\InboundEmailReceived;
use App\Services\InboundEmailRoutingService;
use Illuminate\Contracts\Queue\ShouldQueue;

class HandleInboundEmailReceived implements ShouldQueue
{
    public function __construct(
        protected InboundEmailRoutingService $routingService
    ) {}

    public function handle(InboundEmailReceived $event): void
    {
        $this->routingService->route($event);
    }
}

