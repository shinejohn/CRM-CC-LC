<?php

declare(strict_types=1);

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

/*
|--------------------------------------------------------------------------
| Console Routes & Scheduler
|--------------------------------------------------------------------------
|
| THIS FILE IS THE LIVE SCHEDULER. bootstrap/app.php binds the scheduler via
| ->withRouting(commands: routes/console.php). App\Console\Kernel::schedule()
| is NEVER invoked in Laravel 11/12 with this bootstrap style, so every entry
| lives here. Do NOT re-add entries to App\Console\Kernel — they will not run.
|
| Long/expensive jobs use ->withoutOverlapping() (no self-overlap) and
| ->onOneServer() (runs on a single scheduler instance) even though the
| RUN_SCHEDULER guard in start.sh should already keep the scheduler on one
| Railway service — defense in depth against accidental double-scheduling.
|
*/

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

/*
|--------------------------------------------------------------------------
| Embeddings / AI maintenance
|--------------------------------------------------------------------------
*/
Schedule::command('embeddings:process')->everyFiveMinutes()->withoutOverlapping();
Schedule::command('embeddings:generate-pending')->hourly()->withoutOverlapping();

/*
|--------------------------------------------------------------------------
| Core maintenance & cleanup
|--------------------------------------------------------------------------
*/
Schedule::command('cleanup:old-data')->daily();
Schedule::job(new \App\Jobs\CleanupExpiredTokens)->dailyAt('01:00');

// Horizon metrics snapshots — without this the Horizon "Metrics" dashboard
// (throughput/runtime per job & queue) stays empty. Recommended cadence.
Schedule::command('horizon:snapshot')->everyFiveMinutes();

/*
|--------------------------------------------------------------------------
| CRM & Campaigns
|--------------------------------------------------------------------------
*/
// Manifest Destiny — daily 9 AM run across all active timelines.
// Heavy (iterates 385K enrollments): background + single-server + no overlap.
Schedule::command('manifest-destiny:run')
    ->dailyAt('09:00')
    ->withoutOverlapping()
    ->onOneServer()
    ->runInBackground();

Schedule::job(new \App\Jobs\AdvanceManifestDestinyDay)->dailyAt('00:01');

// Campaign Orchestrator — advance days once per night.
Schedule::job(new \App\Jobs\AdvanceCampaignDays)
    ->dailyAt('00:05')
    ->withoutOverlapping()
    ->onOneServer();

// Campaign Orchestrator — process timelines hourly (heavy, chunked iteration).
Schedule::job(new \App\Jobs\ProcessCampaignTimelines)
    ->hourly()
    ->withoutOverlapping()
    ->onOneServer();

Schedule::job(new \App\Jobs\RecalculateEngagementScores)
    ->dailyAt('02:00')
    ->withoutOverlapping()
    ->onOneServer();

Schedule::job(new \App\Jobs\EvaluateTierTransitions)->dailyAt('03:00');
Schedule::job(new \App\Jobs\RecalculateDataQuality)->weeklyOn(0, '04:00');
Schedule::job(new \App\Jobs\CleanupDeletedSMBs)->weekly();
Schedule::job(new \App\Jobs\CheckUnopenedEmails)->dailyAt('08:00');

// Re-engagement email to disengaged subscribers.
Schedule::job(new \App\Jobs\SendReengagementCampaign)->monthlyOn(1, '10:00');

/*
|--------------------------------------------------------------------------
| Email engine
|--------------------------------------------------------------------------
*/
// Compile email lists nightly.
Schedule::job(new \App\Jobs\CompileAllEmailLists)->dailyAt('02:00');

// Engagement scores (email-engine variant) — weekly.
Schedule::job(new \App\Jobs\UpdateEngagementScores)->weeklyOn(1, '03:00');

// Bounce processing.
Schedule::job(new \App\Jobs\ProcessBounces)->everyTenMinutes();

// Weekly contact-list scrub via ZeroBounce (heavy: re-validates stale contacts).
Schedule::job(new \App\Jobs\ReScrubStaleContactsJob)
    ->weeklyOn(0, '02:00')
    ->withoutOverlapping()
    ->onOneServer();

/*
|--------------------------------------------------------------------------
| Newsletters
|--------------------------------------------------------------------------
*/
Schedule::job(new \App\Jobs\Newsletter\ProcessScheduledNewsletters)->everyMinute();
Schedule::job(new \App\Jobs\Newsletter\ScheduleDailyNewsletters)->dailyAt('00:15');
Schedule::job(new \App\Jobs\Newsletter\ScheduleWeeklyNewsletters)->weeklyOn(0, '00:30');
Schedule::job(new \App\Jobs\Newsletter\UpdateNewsletterStats)->hourly();
Schedule::job(new \App\Jobs\Newsletter\CheckSponsorshipInventory)->dailyAt('09:00');

/*
|--------------------------------------------------------------------------
| Alerts
|--------------------------------------------------------------------------
*/
Schedule::job(new \App\Jobs\Alert\ProcessScheduledAlerts)->everyMinute();
Schedule::job(new \App\Jobs\Alert\UpdateAlertStats)->everyFiveMinutes();
Schedule::job(new \App\Jobs\Alert\CleanupAlertSends)->weekly();

/*
|--------------------------------------------------------------------------
| Billing & Sales
|--------------------------------------------------------------------------
*/
// Process expired self-managed subscriptions.
Schedule::job(new \App\Jobs\RenewExpiredSubscriptions)->dailyAt('06:00');

// Mark overdue invoices.
Schedule::call(static function (): void {
    app(\App\Services\InvoiceService::class)->markOverdue();
})->dailyAt('07:00')->name('invoices:mark-overdue')->withoutOverlapping();

// Expire stale quotes.
Schedule::call(static function (): void {
    app(\App\Services\QuoteService::class)->expireStaleQuotes();
})->dailyAt('07:00')->name('quotes:expire-stale')->withoutOverlapping();

/*
|--------------------------------------------------------------------------
| Marketing / Syndication
|--------------------------------------------------------------------------
*/
Schedule::job(new \App\Jobs\GenerateDailyContentCards)->dailyAt('05:00');
Schedule::job(new \App\Jobs\RecalculateSyndicationEarnings)->weeklyOn(1, '06:00');

/*
|--------------------------------------------------------------------------
| Publishing Platform sync (heavy cross-DB pull)
|--------------------------------------------------------------------------
*/
Schedule::job(new \App\Jobs\ReadershipSyncJob)->dailyAt('01:00');
Schedule::command('sync:from-publishing-platform')
    ->dailyAt('01:30')
    ->withoutOverlapping()
    ->onOneServer()
    ->runInBackground();

/*
|--------------------------------------------------------------------------
| Communication infrastructure (Module 0B)
|--------------------------------------------------------------------------
*/
// Priority dispatcher — high-frequency; guard against overlap.
Schedule::call(static function (): void {
    app(\App\Services\Communication\PriorityDispatcher::class)->dispatch();
})->everyTenSeconds()->name('comms:priority-dispatch')->withoutOverlapping();

Schedule::job(new \App\Jobs\Communication\CleanupMessageQueue)->dailyAt('04:00');
Schedule::job(new \App\Jobs\Communication\UpdateChannelHealth)->everyFiveMinutes();
Schedule::job(new \App\Jobs\Communication\ProcessSuppressions)->everyFifteenMinutes();
Schedule::job(new \App\Jobs\Communication\ReleaseStuckMessages)->everyFiveMinutes();
Schedule::job(new \App\Jobs\Communication\PersistRateLimitCounters)->everyFiveMinutes();

/*
|--------------------------------------------------------------------------
| Sarah Pitch Engine
|--------------------------------------------------------------------------
*/
Schedule::call(static function (): void {
    app(\App\Services\Pitch\ReengagementQueueService::class)->dispatch();
})->everyFifteenMinutes()->name('pitch:reengagement')->withoutOverlapping();

Schedule::call(static function (): void {
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
})->hourly()->name('pitch:abandon-stale')->withoutOverlapping();

Schedule::call(static function (): void {
    app(\App\Services\Pitch\ReengagementQueueService::class)->dispatchFounderExpiryAlerts();
})->dailyAt('09:00')->name('pitch:founder-expiry-alerts');
