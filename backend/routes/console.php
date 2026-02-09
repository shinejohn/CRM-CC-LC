<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Scheduled Jobs for SMB CRM Module
Schedule::job(new \App\Jobs\RecalculateEngagementScores)->dailyAt('02:00');
Schedule::job(new \App\Jobs\EvaluateTierTransitions)->dailyAt('03:00');
Schedule::job(new \App\Jobs\AdvanceManifestDestinyDay)->dailyAt('00:01');
Schedule::job(new \App\Jobs\CleanupDeletedSMBs)->weekly();
Schedule::job(new \App\Jobs\RecalculateDataQuality)->weeklyOn(0, '04:00');





