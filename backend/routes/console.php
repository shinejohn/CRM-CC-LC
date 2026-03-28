<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Core maintenance & cleanup
Schedule::job(new \App\Jobs\CleanupExpiredTokens)->dailyAt('01:00');

// CRM & Campaigns
Schedule::job(new \App\Jobs\AdvanceCampaignDays)->dailyAt('00:05');

// Newsletters
Schedule::job(new \App\Jobs\Newsletter\ProcessScheduledNewsletters)->everyMinute();
Schedule::job(new \App\Jobs\Newsletter\ScheduleDailyNewsletters)->dailyAt('00:15');
Schedule::job(new \App\Jobs\Newsletter\ScheduleWeeklyNewsletters)->weeklyOn(0, '00:30');
Schedule::job(new \App\Jobs\Newsletter\UpdateNewsletterStats)->hourly();

// Alerts
Schedule::job(new \App\Jobs\Alert\ProcessScheduledAlerts)->everyMinute();
Schedule::job(new \App\Jobs\Alert\CleanupAlertSends)->weekly();

// Scheduled Jobs for SMB CRM Module
Schedule::job(new \App\Jobs\RecalculateEngagementScores)->dailyAt('02:00');
Schedule::job(new \App\Jobs\EvaluateTierTransitions)->dailyAt('03:00');
Schedule::job(new \App\Jobs\AdvanceManifestDestinyDay)->dailyAt('00:01');
Schedule::job(new \App\Jobs\CleanupDeletedSMBs)->weekly();
Schedule::job(new \App\Jobs\RecalculateDataQuality)->weeklyOn(0, '04:00');

// Email Engine — Weekly contact list scrub via ZeroBounce
Schedule::job(new \App\Jobs\ReScrubStaleContactsJob)->weeklyOn(0, '02:00');

// Additional Campaign & Email Delivery Jobs
Illuminate\Support\Facades\Schedule::job(new \App\Jobs\ProcessCampaignTimelines)->hourly();
Illuminate\Support\Facades\Schedule::job(new \App\Jobs\CheckUnopenedEmails)->dailyAt('08:00');
Illuminate\Support\Facades\Schedule::job(new \App\Jobs\ProcessBounces)->everyTenMinutes();
