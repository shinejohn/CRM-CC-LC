<?php

namespace App\Jobs;

use App\Models\CustomerTimelineProgress;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class AdvanceCampaignDays implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     */
    public function __construct()
    {
        $this->onQueue('campaigns');
    }

    /**
     * Execute the job.
     * 
     * This job runs daily to advance customers to the next day in their timelines
     * if all actions for the current day have been completed.
     */
    public function handle(): void
    {
        Log::info('Advancing campaign timeline days for eligible customers');
        
        try {
            // Get all active timeline progress records
            $activeProgress = CustomerTimelineProgress::where('status', 'active')
                ->with(['customer', 'timeline'])
                ->get();
            
            $advanced = 0;
            $completed = 0;
            
            foreach ($activeProgress as $progress) {
                // Load timeline if not already loaded
                if (!$progress->relationLoaded('timeline')) {
                    $progress->load('timeline');
                }
                
                $timeline = $progress->timeline;
                $actions = $timeline->getActionsForDay($progress->current_day);
                
                // Get completed and skipped actions
                $completedOrSkipped = array_merge(
                    $progress->completed_actions ?? [],
                    $progress->skipped_actions ?? []
                );
                
                // Check if all actions for current day are done
                $allDone = $actions->every(fn($action) => in_array($action->id, $completedOrSkipped));
                
                if ($allDone) {
                    // Check if a full day has passed since starting this day
                    $dayStarted = $progress->started_at->copy()->addDays($progress->current_day - 1);
                    
                    if (now()->gte($dayStarted->addDay())) {
                        $oldDay = $progress->current_day;
                        $progress->advanceDay();
                        
                        if ($progress->status === 'completed') {
                            $completed++;
                            Log::info("Customer {$progress->customer_id} completed timeline {$timeline->name}");
                        } else {
                            $advanced++;
                            Log::info("Advanced customer {$progress->customer_id} from day {$oldDay} to day {$progress->current_day}");
                        }
                    }
                }
            }
            
            Log::info("Campaign day advancement completed", [
                'customers_advanced' => $advanced,
                'timelines_completed' => $completed,
                'total_processed' => $activeProgress->count(),
            ]);
            
        } catch (\Exception $e) {
            Log::error('Failed to advance campaign days', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            
            throw $e;
        }
    }
}

