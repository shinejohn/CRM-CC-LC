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

        // Compile email lists nightly
        $schedule->job(new \App\Jobs\CompileAllEmailLists)->dailyAt('02:00');

        // Update engagement scores weekly
        $schedule->job(new \App\Jobs\UpdateEngagementScores)->weeklyOn(1, '03:00');

        // Clean up expired verification tokens
        $schedule->job(new \App\Jobs\CleanupExpiredTokens)->dailyAt('04:00');

        // Process bounces and update subscriber status
        $schedule->job(new \App\Jobs\ProcessBounces)->everyFifteenMinutes();

        // Send re-engagement campaign to disengaged subscribers
        $schedule->job(new \App\Jobs\SendReengagementCampaign)->monthlyOn(1, '10:00');

        // Newsletter scheduling
        // Generate and schedule daily newsletters
        // Runs at midnight, schedules for each community's preferred time
        $schedule->job(new \App\Jobs\Newsletter\ScheduleDailyNewsletters)->dailyAt('00:05');

        // Generate and schedule weekly newsletters
        // Runs Sunday at midnight, schedules for each community's preferred day/time
        $schedule->job(new \App\Jobs\Newsletter\ScheduleWeeklyNewsletters)->weeklyOn(0, '00:10');

        // Process scheduled newsletters (check every minute)
        $schedule->job(new \App\Jobs\Newsletter\ProcessScheduledNewsletters)->everyMinute();

        // Update newsletter stats from delivery events
        $schedule->job(new \App\Jobs\Newsletter\UpdateNewsletterStats)->everyFiveMinutes();

        // Check sponsorship inventory and alert if low
        $schedule->job(new \App\Jobs\Newsletter\CheckSponsorshipInventory)->dailyAt('09:00');

        // Process scheduled alerts
        $schedule->job(new \App\Jobs\Alert\ProcessScheduledAlerts)->everyMinute();

        // Update alert stats from delivery events
        $schedule->job(new \App\Jobs\Alert\UpdateAlertStats)->everyFiveMinutes();

        // Clean up old alert_sends records (keep 90 days)
        $schedule->job(new \App\Jobs\Alert\CleanupAlertSends)->dailyAt('03:00');

        // Campaign Orchestrator - Process timelines hourly
        $schedule->job(new \App\Jobs\ProcessCampaignTimelines)->hourly();

        // Campaign Orchestrator - Advance days daily at midnight
        $schedule->job(new \App\Jobs\AdvanceCampaignDays)->dailyAt('00:00');

        // Manifest Destiny — daily 9 AM run across all active timelines
        $schedule->command('manifest-destiny:run')->dailyAt('09:00');

        // Readership analytics sync — pull PP metrics nightly
        $schedule->job(new \App\Jobs\ReadershipSyncJob)->dailyAt('01:00');

        // Publishing Platform data sync — pull communities & businesses nightly
        $schedule->command('sync:from-publishing-platform')->dailyAt('01:30');

        // Communication Infrastructure (Module 0B)
        // Priority dispatcher - runs every 10 seconds
        $schedule->call(function () {
            app(\App\Services\Communication\PriorityDispatcher::class)->dispatch();
        })->everyTenSeconds();

        // Clean up old messages (keep 30 days)
        $schedule->job(new \App\Jobs\Communication\CleanupMessageQueue)->dailyAt('04:00');

        // Update channel health metrics
        $schedule->job(new \App\Jobs\Communication\UpdateChannelHealth)->everyFiveMinutes();

        // Compile suppression list from bounces/complaints
        $schedule->job(new \App\Jobs\Communication\ProcessSuppressions)->everyFifteenMinutes();

        // Release stuck messages (locked > 10 minutes)
        $schedule->job(new \App\Jobs\Communication\ReleaseStuckMessages)->everyFiveMinutes();

        // Update rate limit counters from Redis to DB
        $schedule->job(new \App\Jobs\Communication\PersistRateLimitCounters)->everyFiveMinutes();

        // Sarah Pitch Engine — re-engagement queue
        $schedule->call(static function () {
            app(\App\Services\Pitch\ReengagementQueueService::class)->dispatch();
        })->everyFifteenMinutes();

        $schedule->call(static function (): void {
            $sessions = \App\Models\PitchSession::query()
                ->where('status', 'pitching')
                ->whereNotNull('last_active_at')
                ->where('last_active_at', '<', now()->subHours(4))
                ->get();

            $enrichment = app(\App\Services\Pitch\PitchEnrichmentService::class);
            foreach ($sessions as $session) {
                $enrichment->process($session, 'session_abandoned', [
                    'last_step' => $session->last_step,
                    'gates_remaining' => [],
                ]);
                $session->update([
                    'status' => 'abandoned',
                    'abandoned_at' => now(),
                ]);
            }
        })->hourly();

        $schedule->call(static function () {
            app(\App\Services\Pitch\ReengagementQueueService::class)->dispatchFounderExpiryAlerts();
        })->dailyAt('09:00');
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
