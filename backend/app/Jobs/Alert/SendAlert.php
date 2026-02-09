<?php

namespace App\Jobs\Alert;

use App\Services\Alert\AlertService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class SendAlert implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public int $alertId
    ) {
        $this->onQueue('alerts');
    }

    public function handle(AlertService $alertService): void
    {
        $alertService->send($this->alertId);
    }
}



