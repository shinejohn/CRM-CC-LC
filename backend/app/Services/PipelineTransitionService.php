<?php

namespace App\Services;

use App\Models\Customer;
use App\Enums\PipelineStage;
use App\Events\PipelineStageChanged;
use Illuminate\Support\Facades\Log;

class PipelineTransitionService
{
    public function __construct(
        protected ?CampaignOrchestratorService $orchestrator = null
    ) {
        // Make orchestrator optional in case it doesn't exist yet (Agent A's work)
        if (!$this->orchestrator && class_exists(\App\Services\CampaignOrchestratorService::class)) {
            $this->orchestrator = app(\App\Services\CampaignOrchestratorService::class);
        }
    }
    
    public function transition(Customer $customer, PipelineStage $newStage, string $trigger): bool
    {
        $currentStage = $customer->pipeline_stage;
        
        if (!$this->isValidTransition($currentStage, $newStage)) {
            Log::warning("Invalid pipeline transition attempted", [
                'customer_id' => $customer->id,
                'from' => $currentStage?->value,
                'to' => $newStage->value,
            ]);
            return false;
        }
        
        $customer->advanceToStage($newStage, $trigger);
        
        event(new PipelineStageChanged($customer, $currentStage, $newStage, $trigger));
        
        Log::info("Customer {$customer->id} transitioned from {$currentStage?->value} to {$newStage->value}", [
            'trigger' => $trigger,
        ]);
        
        return true;
    }
    
    protected function isValidTransition(?PipelineStage $from, PipelineStage $to): bool
    {
        if ($to === PipelineStage::CHURNED) {
            return true; // Can always churn
        }
        
        if ($from === null) {
            return true; // Can set initial stage
        }
        
        $validNext = $from->nextStage();
        return $validNext === $to;
    }
    
    public function checkEngagementThreshold(Customer $customer): void
    {
        $score = $customer->engagement_score ?? 0;
        $stage = $customer->pipeline_stage;
        
        if (!$stage) {
            return;
        }
        
        $thresholds = [
            PipelineStage::HOOK->value => 50,
            PipelineStage::ENGAGEMENT->value => 80,
        ];
        
        $threshold = $thresholds[$stage->value] ?? null;
        
        if ($threshold && $score >= $threshold) {
            $nextStage = $stage->nextStage();
            if ($nextStage) {
                $this->transition($customer, $nextStage, 'engagement_threshold');
            }
        }
    }
    
    public function handleTrialAcceptance(Customer $customer): void
    {
        if ($customer->pipeline_stage !== PipelineStage::HOOK) {
            return;
        }
        
        $customer->update([
            'trial_started_at' => now(),
            'trial_ends_at' => now()->addDays(90),
            'trial_active' => true,
        ]);
        
        // Assign timeline if orchestrator exists
        if ($this->orchestrator && method_exists($this->orchestrator, 'assignTimelineForStage')) {
            $this->orchestrator->assignTimelineForStage($customer);
        }
        
        Log::info("Trial started for customer {$customer->id}");
    }
    
    public function handleConversion(Customer $customer): void
    {
        if ($customer->pipeline_stage === PipelineStage::SALES) {
            $this->transition($customer, PipelineStage::RETENTION, 'conversion');
        }
    }
}

