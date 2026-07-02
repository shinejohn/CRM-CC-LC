<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * Define the application's command schedule.
     *
     * INTENTIONALLY EMPTY. With the Laravel 11/12 bootstrap in bootstrap/app.php
     * (->withRouting(commands: routes/console.php)), this Kernel is never bound
     * and schedule() is never invoked. ALL scheduled tasks live in
     * routes/console.php — the single live scheduler. Adding entries here would
     * silently NOT run. Do not restore the old body.
     */
    protected function schedule(Schedule $schedule): void
    {
        // No-op: see routes/console.php for the real schedule.
    }

    /**
     * Register the commands for the application.
     */
    protected function commands(): void
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
}
