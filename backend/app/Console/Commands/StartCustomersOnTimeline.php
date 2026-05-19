<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Contracts\CampaignOrchestratorInterface;
use App\Enums\PipelineStage;
use App\Models\CampaignTimeline;
use App\Models\Customer;
use App\Models\CustomerTimelineProgress;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

/**
 * Batch-start customers on their pipeline stage's campaign timeline.
 *
 * Finds all customers in a given stage who are NOT already on an active
 * timeline, and enrolls them. This is the "kick-off" command that seeds
 * the Manifest Destiny pipeline for the first time (or catches new imports).
 */
final class StartCustomersOnTimeline extends Command
{
    protected $signature = 'campaign:start-customers
        {--stage=hook : Pipeline stage to target (hook, engagement, sales, retention)}
        {--state= : Filter customers by state (e.g., FL, TX)}
        {--community= : Filter customers by community slug}
        {--limit=0 : Max customers to enroll (0 = no limit)}
        {--dry-run : Show what would happen without enrolling}';

    protected $description = 'Enroll customers on the campaign timeline for their pipeline stage';

    public function handle(CampaignOrchestratorInterface $orchestrator): int
    {
        $stageName = strtolower((string) $this->option('stage'));
        $stage = PipelineStage::tryFrom($stageName);

        if (! $stage) {
            $this->error("Invalid pipeline stage: {$stageName}. Valid: hook, engagement, sales, retention, churned");

            return self::FAILURE;
        }

        $timeline = CampaignTimeline::getActiveForStage($stage);

        if (! $timeline) {
            $this->error("No active timeline found for stage '{$stageName}'. Run the ManifestDestinyTimelineSeeder first.");

            return self::FAILURE;
        }

        $this->info("Timeline: {$timeline->name} ({$timeline->duration_days} days)");

        // Build the customer query
        $query = Customer::withoutGlobalScopes()
            ->where('pipeline_stage', $stage)
            ->canReceiveEmail()
            ->whereNotIn('id', function ($sub) use ($timeline): void {
                $sub->select('customer_id')
                    ->from('customer_timeline_progress')
                    ->where('campaign_timeline_id', $timeline->id)
                    ->whereIn('status', ['active', 'completed']);
            });

        // Optional filters
        $stateFilter = $this->option('state');
        if ($stateFilter) {
            $query->where('state', strtoupper($stateFilter));
            $this->info("Filtering by state: " . strtoupper($stateFilter));
        }

        $communitySlug = $this->option('community');
        if ($communitySlug) {
            $query->whereHas('community', function ($q) use ($communitySlug): void {
                $q->where('slug', $communitySlug);
            });
            $this->info("Filtering by community: {$communitySlug}");
        }

        $limit = (int) $this->option('limit');
        if ($limit > 0) {
            $query->limit($limit);
        }

        $total = (clone $query)->count();
        $this->info("Found {$total} eligible customers not yet on a timeline.");

        if ($total === 0) {
            $this->info('Nothing to do.');

            return self::SUCCESS;
        }

        if ($this->option('dry-run')) {
            $this->warn('DRY RUN — no customers will be enrolled.');

            $preview = (clone $query)->limit(20)->get(['id', 'business_name', 'state', 'city', 'email']);
            $rows = $preview->map(fn ($c) => [
                $c->business_name,
                $c->city,
                $c->state,
                $c->email,
            ])->toArray();
            $this->table(['Business', 'City', 'State', 'Email'], $rows);

            if ($total > 20) {
                $this->line("  ... and " . ($total - 20) . " more.");
            }

            return self::SUCCESS;
        }

        $this->withProgressBar($query->cursor(), function (Customer $customer) use ($orchestrator, $timeline): void {
            $orchestrator->startTimeline($customer, $timeline);
        });

        $this->newLine();
        $this->info("Enrolled {$total} customers on '{$timeline->name}'.");

        Log::info('campaign:start-customers completed', [
            'stage' => $stageName,
            'timeline' => $timeline->name,
            'enrolled' => $total,
            'state_filter' => $stateFilter,
        ]);

        return self::SUCCESS;
    }
}
