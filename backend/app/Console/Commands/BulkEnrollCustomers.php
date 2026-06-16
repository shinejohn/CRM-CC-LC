<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Enums\PipelineStage;
use App\Models\CampaignTimeline;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

/**
 * Bulk-enroll customers into a timeline using a single INSERT...SELECT.
 * Much faster than StartCustomersOnTimeline for initial mass enrollment.
 */
final class BulkEnrollCustomers extends Command
{
    protected $signature = 'campaign:bulk-enroll
        {--stage=hook : Pipeline stage to target}
        {--dry-run : Show count without inserting}';

    protected $description = 'Bulk-enroll all eligible customers into a timeline via single INSERT...SELECT';

    public function handle(): int
    {
        $stageName = strtolower((string) $this->option('stage'));
        $stage = PipelineStage::tryFrom($stageName);

        if (! $stage) {
            $this->error("Invalid stage: {$stageName}");
            return self::FAILURE;
        }

        $timeline = CampaignTimeline::getActiveForStage($stage);

        if (! $timeline) {
            $this->error("No active timeline for stage '{$stageName}'. Run ManifestDestinyTimelineSeeder first.");
            return self::FAILURE;
        }

        $this->info("Timeline: {$timeline->name}");

        // Count eligible customers: in stage, can receive email, not already enrolled
        $count = DB::selectOne("
            SELECT COUNT(*) AS cnt
            FROM customers c
            WHERE c.pipeline_stage = ?
              AND (c.email_suppressed IS NULL OR c.email_suppressed = false)
              AND c.email IS NOT NULL
              AND c.email != ''
              AND NOT EXISTS (
                  SELECT 1 FROM customer_timeline_progress ctp
                  WHERE ctp.customer_id = c.id
                    AND ctp.campaign_timeline_id = ?
                    AND ctp.status IN ('active', 'completed')
              )
        ", [$stageName, $timeline->id]);

        $total = $count->cnt ?? 0;
        $this->info("Eligible customers: {$total}");

        if ($total === 0) {
            $this->info('Nothing to enroll.');
            return self::SUCCESS;
        }

        if ($this->option('dry-run')) {
            $this->warn('DRY RUN — no rows inserted.');
            return self::SUCCESS;
        }

        $now = now()->toDateTimeString();
        $timelineId = $timeline->id;

        // Single bulk INSERT...SELECT — enrolls all eligible customers at once
        $inserted = DB::statement("
            INSERT INTO customer_timeline_progress
                (id, customer_id, campaign_timeline_id, current_day, started_at, status, completed_actions, skipped_actions, created_at, updated_at)
            SELECT
                gen_random_uuid(),
                c.id,
                ?,
                1,
                NOW(),
                'active',
                '[]',
                '[]',
                NOW(),
                NOW()
            FROM customers c
            WHERE c.pipeline_stage = ?
              AND (c.email_suppressed IS NULL OR c.email_suppressed = false)
              AND c.email IS NOT NULL
              AND c.email != ''
              AND NOT EXISTS (
                  SELECT 1 FROM customer_timeline_progress ctp
                  WHERE ctp.customer_id = c.id
                    AND ctp.campaign_timeline_id = ?
                    AND ctp.status IN ('active', 'completed')
              )
        ", [$timelineId, $stageName, $timelineId]);

        $this->info("✓ Bulk enrolled {$total} customers on '{$timeline->name}'.");

        return self::SUCCESS;
    }
}
