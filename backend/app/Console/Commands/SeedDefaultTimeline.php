<?php

namespace App\Console\Commands;

use App\Models\CampaignTimeline;
use App\Models\CampaignTimelineAction;
use App\Enums\PipelineStage;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class SeedDefaultTimeline extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'timeline:seed-default 
                            {--stage=hook : Pipeline stage (hook, engagement, sales, retention)}
                            {--days=90 : Duration in days}
                            {--force : Overwrite existing default timeline}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Seed a default 90-day campaign timeline for a pipeline stage';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $stageInput = $this->option('stage');
        $days = (int) $this->option('days');
        $force = $this->option('force');
        
        // Validate stage
        try {
            $stage = PipelineStage::from($stageInput);
        } catch (\ValueError $e) {
            $this->error("Invalid pipeline stage: {$stageInput}");
            $this->info("Valid stages: hook, engagement, sales, retention");
            return Command::FAILURE;
        }
        
        // Check if default timeline already exists
        $existing = CampaignTimeline::where('pipeline_stage', $stage)
            ->where('is_active', true)
            ->first();
            
        if ($existing && !$force) {
            $this->warn("Default timeline for stage '{$stage->value}' already exists (ID: {$existing->id})");
            $this->info("Use --force to overwrite");
            return Command::FAILURE;
        }
        
        DB::transaction(function () use ($stage, $days, $existing) {
            // Delete existing if force
            if ($existing && $this->option('force')) {
                $this->info("Deleting existing timeline...");
                $existing->delete();
            }
            
            // Create timeline
            $timeline = CampaignTimeline::create([
                'name' => "Default {$stage->label()} Timeline",
                'slug' => "default-{$stage->value}-timeline",
                'description' => "Default {$days}-day campaign timeline for {$stage->label()} stage",
                'pipeline_stage' => $stage,
                'duration_days' => $days,
                'is_active' => true,
                'metadata' => [
                    'is_default' => true,
                    'created_by' => 'seed-command',
                ],
            ]);
            
            $this->info("Created timeline: {$timeline->name} (ID: {$timeline->id})");
            
            // Seed default actions based on stage
            $this->seedActionsForStage($timeline, $stage, $days);
            
            $this->info("Timeline seeded successfully with default actions");
        });
        
        return Command::SUCCESS;
    }
    
    /**
     * Seed default actions for a pipeline stage.
     */
    protected function seedActionsForStage(CampaignTimeline $timeline, PipelineStage $stage, int $days): void
    {
        $actions = [];
        
        match($stage) {
            PipelineStage::HOOK => $actions = $this->getHookStageActions($days),
            PipelineStage::ENGAGEMENT => $actions = $this->getEngagementStageActions($days),
            PipelineStage::SALES => $actions = $this->getSalesStageActions($days),
            PipelineStage::RETENTION => $actions = $this->getRetentionStageActions($days),
            default => $this->warn("No default actions defined for stage: {$stage->value}"),
        };
        
        $created = 0;
        foreach ($actions as $actionData) {
            CampaignTimelineAction::create(array_merge($actionData, [
                'campaign_timeline_id' => $timeline->id,
            ]));
            $created++;
        }
        
        $this->info("Created {$created} actions for timeline");
    }
    
    /**
     * Get default actions for Hook (Trial) stage.
     */
    protected function getHookStageActions(int $days): array
    {
        return [
            // Day 1: Welcome email
            [
                'day_number' => 1,
                'channel' => 'email',
                'action_type' => 'send_email',
                'template_type' => 'welcome',
                'delay_hours' => 0,
                'priority' => 1,
                'is_active' => true,
                'description' => 'Welcome email on day 1',
            ],
            
            // Day 3: Follow-up email
            [
                'day_number' => 3,
                'channel' => 'email',
                'action_type' => 'send_email',
                'template_type' => 'follow_up',
                'delay_hours' => 0,
                'priority' => 1,
                'is_active' => true,
                'conditions' => [
                    'if' => 'email_opened',
                    'within_hours' => 48,
                    'then' => 'skip',
                ],
                'description' => 'Follow-up email if welcome email not opened',
            ],
            
            // Day 7: Value delivery email
            [
                'day_number' => 7,
                'channel' => 'email',
                'action_type' => 'send_email',
                'template_type' => 'value_delivery',
                'delay_hours' => 0,
                'priority' => 1,
                'is_active' => true,
                'description' => 'Value delivery email',
            ],
            
            // Day 14: Check engagement
            [
                'day_number' => 14,
                'channel' => 'system',
                'action_type' => 'check_engagement',
                'delay_hours' => 0,
                'priority' => 1,
                'is_active' => true,
                'parameters' => [
                    'threshold' => 50,
                ],
                'description' => 'Check if engagement score meets threshold',
            ],
            
            // Day 30: Mid-trial check-in
            [
                'day_number' => 30,
                'channel' => 'email',
                'action_type' => 'send_email',
                'template_type' => 'trial_checkin',
                'delay_hours' => 0,
                'priority' => 1,
                'is_active' => true,
                'description' => 'Mid-trial check-in email',
            ],
            
            // Day 60: Pre-conversion email
            [
                'day_number' => 60,
                'channel' => 'email',
                'action_type' => 'send_email',
                'template_type' => 'pre_conversion',
                'delay_hours' => 0,
                'priority' => 1,
                'is_active' => true,
                'description' => 'Pre-conversion email',
            ],
            
            // Day 85: Final trial reminder
            [
                'day_number' => 85,
                'channel' => 'email',
                'action_type' => 'send_email',
                'template_type' => 'trial_ending',
                'delay_hours' => 0,
                'priority' => 1,
                'is_active' => true,
                'description' => 'Trial ending reminder',
            ],
        ];
    }
    
    /**
     * Get default actions for Engagement stage.
     */
    protected function getEngagementStageActions(int $days): array
    {
        return [
            // Day 1: Engagement welcome
            [
                'day_number' => 1,
                'channel' => 'email',
                'action_type' => 'send_email',
                'template_type' => 'engagement_welcome',
                'delay_hours' => 0,
                'priority' => 1,
                'is_active' => true,
                'description' => 'Welcome to engagement stage',
            ],
            
            // Day 7: Weekly value delivery
            [
                'day_number' => 7,
                'channel' => 'email',
                'action_type' => 'send_email',
                'template_type' => 'weekly_value',
                'delay_hours' => 0,
                'priority' => 1,
                'is_active' => true,
                'description' => 'Weekly value delivery',
            ],
            
            // Day 14: Check engagement threshold
            [
                'day_number' => 14,
                'channel' => 'system',
                'action_type' => 'check_engagement',
                'delay_hours' => 0,
                'priority' => 1,
                'is_active' => true,
                'parameters' => [
                    'threshold' => 80,
                ],
                'description' => 'Check if ready for sales stage',
            ],
        ];
    }
    
    /**
     * Get default actions for Sales stage.
     */
    protected function getSalesStageActions(int $days): array
    {
        return [
            // Day 1: Sales stage welcome
            [
                'day_number' => 1,
                'channel' => 'email',
                'action_type' => 'send_email',
                'template_type' => 'sales_welcome',
                'delay_hours' => 0,
                'priority' => 1,
                'is_active' => true,
                'description' => 'Welcome to sales stage',
            ],
            
            // Day 3: Sales call scheduling
            [
                'day_number' => 3,
                'channel' => 'phone',
                'action_type' => 'make_call',
                'delay_hours' => 0,
                'priority' => 1,
                'is_active' => true,
                'parameters' => [
                    'script_id' => 'sales_intro',
                ],
                'description' => 'Schedule sales call',
            ],
        ];
    }
    
    /**
     * Get default actions for Retention stage.
     */
    protected function getRetentionStageActions(int $days): array
    {
        return [
            // Day 1: Retention welcome
            [
                'day_number' => 1,
                'channel' => 'email',
                'action_type' => 'send_email',
                'template_type' => 'retention_welcome',
                'delay_hours' => 0,
                'priority' => 1,
                'is_active' => true,
                'description' => 'Welcome to retention stage',
            ],
            
            // Day 30: Monthly check-in
            [
                'day_number' => 30,
                'channel' => 'email',
                'action_type' => 'send_email',
                'template_type' => 'monthly_checkin',
                'delay_hours' => 0,
                'priority' => 1,
                'is_active' => true,
                'description' => 'Monthly retention check-in',
            ],
        ];
    }
}

