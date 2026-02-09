<?php

namespace App\Listeners;

use App\Events\PipelineStageChanged;
use App\Services\PipelineTransitionService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;

class HandlePipelineStageChange implements ShouldQueue
{
    use InteractsWithQueue;

    public function __construct(
        protected PipelineTransitionService $transitionService
    ) {}

    /**
     * Handle the event.
     */
    public function handle(PipelineStageChanged $event): void
    {
        try {
            Log::info("HandlePipelineStageChange: Processing stage change", [
                'customer_id' => $event->customer->id,
                'from' => $event->previousStage?->value,
                'to' => $event->newStage->value,
                'trigger' => $event->trigger,
            ]);

            // If orchestrator service exists, assign new timeline for the stage
            // This will be handled by CampaignOrchestratorService when Agent A completes their work
            // For now, we just log the change
            
            // You can add additional logic here, such as:
            // - Sending notifications
            // - Updating analytics
            // - Triggering other workflows

        } catch (\Exception $e) {
            Log::error("HandlePipelineStageChange: Error processing event", [
                'customer_id' => $event->customer->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }

    /**
     * Handle a job failure.
     */
    public function failed(PipelineStageChanged $event, \Throwable $exception): void
    {
        Log::error("HandlePipelineStageChange: Job failed permanently", [
            'customer_id' => $event->customer->id,
            'error' => $exception->getMessage(),
        ]);
    }
}

