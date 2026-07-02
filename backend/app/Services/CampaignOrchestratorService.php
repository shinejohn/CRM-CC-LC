<?php

declare(strict_types=1);

namespace App\Services;

use App\Contracts\CampaignOrchestratorInterface;
use App\Models\Customer;
use App\Models\CampaignTimeline;
use App\Models\CampaignTimelineAction;
use App\Models\CustomerTimelineProgress;
use App\Enums\PipelineStage;
use App\Events\PipelineStageChanged;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

final class CampaignOrchestratorService implements CampaignOrchestratorInterface
{
    public function __construct(
        protected CampaignActionExecutor $actionExecutor
    ) {}
    
    /**
     * Start a customer on a campaign timeline.
     */
    public function startTimeline(Customer $customer, CampaignTimeline $timeline): CustomerTimelineProgress
    {
        // Check if already on this timeline
        $existing = CustomerTimelineProgress::where('customer_id', $customer->id)
            ->where('campaign_timeline_id', $timeline->id)
            ->first();
            
        if ($existing && $existing->status === 'active') {
            return $existing;
        }
        
        $progress = CustomerTimelineProgress::create([
            'customer_id' => $customer->id,
            'campaign_timeline_id' => $timeline->id,
            'current_day' => 1,
            'started_at' => now(),
            'status' => 'active',
            'completed_actions' => [],
            'skipped_actions' => [],
        ]);
        
        Log::info("Started customer {$customer->id} on timeline {$timeline->name}");
        
        return $progress;
    }
    
    /**
     * Auto-assign timeline based on pipeline stage.
     */
    public function assignTimelineForStage(Customer $customer): ?CustomerTimelineProgress
    {
        $timeline = CampaignTimeline::getActiveForStage($customer->pipeline_stage);
        
        if (!$timeline) {
            Log::warning("No active timeline found for stage {$customer->pipeline_stage->value}");
            return null;
        }
        
        return $this->startTimeline($customer, $timeline);
    }
    
    /**
     * Execute today's actions for a single customer.
     */
    public function executeActionsForCustomer(Customer $customer): array
    {
        $results = [];

        // Get all active timeline progress for this customer
        $progressRecords = CustomerTimelineProgress::where('customer_id', $customer->id)
            ->where('status', 'active')
            ->get();

        foreach ($progressRecords as $progress) {
            $dayResults = $this->executeActionsForDay($progress, $customer);
            $results = array_merge($results, $dayResults);

            // Check if we should advance to next day
            $this->checkAndAdvanceDay($progress);
        }

        return $results;
    }
    
    /**
     * Execute actions for a specific day in the timeline.
     */
    protected function executeActionsForDay(CustomerTimelineProgress $progress, ?Customer $customer = null): array
    {
        $results = [];
        $customer = $customer ?? $progress->customer;
        $timeline = $progress->timeline;
        
        // Get actions for current day
        $actions = $timeline->getActionsForDay($progress->current_day);
        
        foreach ($actions as $action) {
            // Skip if already completed
            if ($progress->isActionCompleted($action->id)) {
                continue;
            }
            
            // Check if action should execute (conditions)
            if (!$action->shouldExecute($customer)) {
                $progress->markActionSkipped($action->id);
                $results[] = [
                    'action_id' => $action->id,
                    'status' => 'skipped',
                    'reason' => 'conditions_not_met',
                ];
                continue;
            }
            
            // Check if delay has passed
            if (!$this->hasDelayPassed($progress, $action)) {
                continue; // Not time yet
            }
            
            // Execute the action
            try {
                $result = $this->actionExecutor->execute($customer, $action);
                $progress->markActionCompleted($action->id);
                
                $results[] = [
                    'action_id' => $action->id,
                    'status' => 'completed',
                    'result' => $result,
                ];
                
                Log::info("Executed action {$action->id} for customer {$customer->id}", $result);
                
            } catch (\Throwable $e) {
                // Catch Throwable (not just Exception) so a ValueError/Error/TypeError
                // in ONE customer's action does not abort the entire batch run. This
                // is what previously killed the Manifest Destiny run around day 60 —
                // a single malformed action threw an Error and every remaining
                // customer went unprocessed. Log, record, and continue.
                Log::error("Failed to execute action {$action->id} for customer {$customer->id}", [
                    'error' => $e->getMessage(),
                    'exception' => $e::class,
                ]);

                $results[] = [
                    'action_id' => $action->id,
                    'status' => 'failed',
                    'error' => $e->getMessage(),
                ];
            }
        }
        
        return $results;
    }
    
    /**
     * Check if action's delay has passed.
     */
    protected function hasDelayPassed(CustomerTimelineProgress $progress, CampaignTimelineAction $action): bool
    {
        if ($action->delay_hours === 0) {
            return true;
        }
        
        // Calculate when this day started (based on progress)
        $dayStarted = $progress->started_at->copy()->addDays($progress->current_day - 1);
        $actionDue = $dayStarted->copy()->addHours($action->delay_hours);
        
        return now()->gte($actionDue);
    }
    
    /**
     * Check if all actions for current day are done and advance.
     */
    protected function checkAndAdvanceDay(CustomerTimelineProgress $progress): void
    {
        $actions = $progress->timeline->getActionsForDay($progress->current_day);
        $completedOrSkipped = array_merge(
            $progress->completed_actions ?? [],
            $progress->skipped_actions ?? []
        );
        
        // Check if all actions are done
        $allDone = $actions->every(fn($action) => in_array($action->id, $completedOrSkipped));
        
        if ($allDone) {
            // Check if a full day has passed since starting this day
            $dayStarted = $progress->started_at->copy()->addDays($progress->current_day - 1);
            
            if (now()->gte($dayStarted->addDay())) {
                $progress->advanceDay();
                Log::info("Advanced customer {$progress->customer_id} to day {$progress->current_day}");
            }
        }
    }
    
    /**
     * Process all customers who are due for campaign actions.
     */
    public function processAllDueCustomers(): array
    {
        $results = [];

        // There can be ~385K active progress rows. An unbounded ->get() would try
        // to hydrate all of them (plus eager-loaded customer + timeline) into
        // memory at once and OOM the worker. chunkById streams them in bounded
        // batches, keeping memory flat. chunkById (not chunk) is safe here even
        // though we mutate rows inside the loop — it paginates on the primary key
        // rather than an OFFSET, so advancing/completing rows can't shift the
        // window and skip records.
        CustomerTimelineProgress::where('status', 'active')
            ->with(['customer', 'timeline'])
            ->chunkById(500, function ($batch) use (&$results): void {
                foreach ($batch as $progress) {
                    try {
                        $customerResults = $this->executeActionsForDay($progress);
                        $this->checkAndAdvanceDay($progress);

                        if (! empty($customerResults)) {
                            $results[$progress->customer_id] = $customerResults;
                        }
                    } catch (\Throwable $e) {
                        // Never let one bad progress row abort the whole run.
                        Log::error("processAllDueCustomers: failed for progress {$progress->id}", [
                            'error' => $e->getMessage(),
                            'exception' => $e::class,
                        ]);
                    }
                }
            }, 'id');

        return $results;
    }
    
    /**
     * Pause a customer's timeline.
     */
    public function pauseTimeline(CustomerTimelineProgress $progress): void
    {
        $progress->update([
            'status' => 'paused',
            'paused_at' => now(),
        ]);
    }
    
    /**
     * Resume a paused timeline.
     */
    public function resumeTimeline(CustomerTimelineProgress $progress): void
    {
        $progress->update([
            'status' => 'active',
            'paused_at' => null,
        ]);
    }
}

