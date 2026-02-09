<?php

namespace App\Jobs\Alert;

use App\Models\Alert\AlertSend;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class CleanupAlertSends implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle(): void
    {
        // Delete alert_sends records older than 90 days
        AlertSend::where('created_at', '<', now()->subDays(90))->delete();
    }
}



