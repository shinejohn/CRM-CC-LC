<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * Define the application's command schedule.
     */
    protected function schedule(Schedule $schedule): void
    {
        // Process pending embeddings
        $schedule->command('embeddings:process')
            ->everyFiveMinutes()
            ->withoutOverlapping();
        
        // Clean up old activities/logs
        $schedule->command('cleanup:old-data')
            ->daily();
        
        // Generate missing embeddings
        $schedule->command('embeddings:generate-pending')
            ->hourly();
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

