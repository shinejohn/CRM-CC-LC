<?php

namespace App\Jobs\Alert;

use App\Models\Alert\Alert;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class ProcessScheduledAlerts implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle(): void
    {
        $pendingAlerts = Alert::where('status', 'approved')
            ->where('scheduled_for', '<=', now())
            ->get();
        
        foreach ($pendingAlerts as $alert) {
            dispatch(new SendAlert($alert->id));
        }
    }
}



