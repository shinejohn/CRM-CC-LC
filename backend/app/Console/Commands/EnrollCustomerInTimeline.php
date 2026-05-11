<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Enums\PipelineStage;
use App\Models\CampaignTimeline;
use App\Models\Customer;
use App\Services\CampaignOrchestratorService;
use Illuminate\Console\Command;

final class EnrollCustomerInTimeline extends Command
{
    protected $signature = 'campaign:enroll
        {customer_id : UUID of the customer to enroll}
        {--stage=HOOK : Pipeline stage timeline to use (HOOK, ENGAGEMENT, SALES, RETENTION)}
        {--timeline= : Specific timeline UUID (overrides --stage)}';

    protected $description = 'Enroll a customer into a campaign timeline';

    public function handle(CampaignOrchestratorService $orchestrator): int
    {
        $customerId = $this->argument('customer_id');
        $customer = Customer::find($customerId);

        if (!$customer) {
            $this->error("Customer not found: {$customerId}");

            return 1;
        }

        $this->info("Customer: {$customer->business_name} ({$customer->email})");
        $this->info("Current pipeline stage: {$customer->pipeline_stage->value}");

        $timelineId = $this->option('timeline');

        if ($timelineId) {
            $timeline = CampaignTimeline::find($timelineId);
            if (!$timeline) {
                $this->error("Timeline not found: {$timelineId}");

                return 1;
            }
        } else {
            $stageName = strtolower($this->option('stage'));
            $stage = PipelineStage::tryFrom($stageName);

            if (!$stage) {
                $this->error("Invalid stage: {$stageName}. Valid: HOOK, ENGAGEMENT, SALES, RETENTION, CHURNED");

                return 1;
            }

            $timeline = CampaignTimeline::getActiveForStage($stage);

            if (!$timeline) {
                $this->error("No active timeline found for stage: {$stage->value}");
                $this->info('Available timelines:');
                CampaignTimeline::where('is_active', true)->get()->each(function ($t): void {
                    $this->line("  - {$t->name} (stage: {$t->pipeline_stage->value}, {$t->duration_days} days)");
                });

                return 1;
            }
        }

        $this->info("Timeline: {$timeline->name} ({$timeline->duration_days} days)");

        $progress = $orchestrator->startTimeline($customer, $timeline);

        $this->newLine();
        $this->info('Enrollment complete.');
        $this->table(
            ['Field', 'Value'],
            [
                ['Progress ID', $progress->id],
                ['Status', $progress->status],
                ['Current Day', $progress->current_day],
                ['Started At', $progress->started_at->toDateTimeString()],
            ]
        );

        return 0;
    }
}
