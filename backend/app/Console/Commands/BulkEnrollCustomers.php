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
        {--state= : Restrict to a community state (2-letter, e.g. FL)}
        {--county= : Restrict to a community county (matched with ILIKE prefix, e.g. Hillsborough)}
        {--dry-run : Show count without inserting}';

    protected $description = 'Bulk-enroll eligible customers into a timeline via single INSERT...SELECT (optionally scoped by state/county)';

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

        // Build optional geographic scope (joins customers -> communities by community_id).
        $state = $this->option('state') ? strtoupper((string) $this->option('state')) : null;
        $county = $this->option('county') ? (string) $this->option('county') : null;

        $geoJoin = '';
        $geoWhere = '';
        $geoBindings = [];

        if ($state !== null || $county !== null) {
            $geoJoin = ' JOIN communities co ON co.id = c.community_id ';
            if ($state !== null) {
                $geoWhere .= ' AND co.state = ? ';
                $geoBindings[] = $state;
            }
            if ($county !== null) {
                $geoWhere .= ' AND co.county ILIKE ? ';
                $geoBindings[] = $county.'%';
            }
            $this->info('Scope: '.trim(($state ?? '').' '.($county ? $county.' County' : '')));
        } else {
            $this->warn('Scope: ALL communities (no state/county filter).');
        }

        // Eligibility: in stage, can receive email, optional geo, not already enrolled.
        $countBindings = array_merge([$stageName], $geoBindings, [$timeline->id]);

        $count = DB::selectOne("
            SELECT COUNT(*) AS cnt
            FROM customers c
            {$geoJoin}
            WHERE c.pipeline_stage = ?
              AND (c.email_suppressed IS NULL OR c.email_suppressed = false)
              AND c.email IS NOT NULL
              AND c.email != ''
              {$geoWhere}
              AND NOT EXISTS (
                  SELECT 1 FROM customer_timeline_progress ctp
                  WHERE ctp.customer_id = c.id
                    AND ctp.campaign_timeline_id = ?
                    AND ctp.status IN ('active', 'completed')
              )
        ", $countBindings);

        $total = (int) ($count->cnt ?? 0);
        $this->info("Eligible customers: {$total}");

        if ($total === 0) {
            $this->info('Nothing to enroll.');
            return self::SUCCESS;
        }

        if ($this->option('dry-run')) {
            $this->warn('DRY RUN — no rows inserted.');
            return self::SUCCESS;
        }

        $timelineId = $timeline->id;
        $insertBindings = array_merge([$timelineId, $stageName], $geoBindings, [$timelineId]);

        // Single bulk INSERT...SELECT — enrolls all eligible customers at once.
        DB::statement("
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
            {$geoJoin}
            WHERE c.pipeline_stage = ?
              AND (c.email_suppressed IS NULL OR c.email_suppressed = false)
              AND c.email IS NOT NULL
              AND c.email != ''
              {$geoWhere}
              AND NOT EXISTS (
                  SELECT 1 FROM customer_timeline_progress ctp
                  WHERE ctp.customer_id = c.id
                    AND ctp.campaign_timeline_id = ?
                    AND ctp.status IN ('active', 'completed')
              )
        ", $insertBindings);

        $this->info("✓ Bulk enrolled {$total} customers on '{$timeline->name}'.");

        return self::SUCCESS;
    }
}
