<?php

namespace App\Listeners;

use App\Events\EngagementThresholdReached;
use App\Services\PipelineTransitionService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;

class AdvanceStageOnEngagementThreshold implements ShouldQueue
{
    use InteractsWithQueue;

    public function __construct(
        protected PipelineTransitionService $transitionService
    ) {}

    /**
     * Handle the event.
     */
    public function handle(EngagementThresholdReached $event): void
    {
        try {
            Log::info("AdvanceStageOnEngagementThreshold: Checking if stage advancement needed", [
                'customer_id' => $event->customer->id,
                'previous_score' => $event->previousScore,
                'new_score' => $event->newScore,
                'threshold_type' => $event->thresholdType,
            ]);

            // Check if customer meets threshold for stage advancement
            $this->transitionService->checkEngagementThreshold($event->customer);

        } catch (\Exception $e) {
            Log::error("AdvanceStageOnEngagementThreshold: Error processing event", [
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
    public function failed(EngagementThresholdReached $event, \Throwable $exception): void
    {
        Log::error("AdvanceStageOnEngagementThreshold: Job failed permanently", [
            'customer_id' => $event->customer->id,
            'error' => $exception->getMessage(),
        ]);
    }
}

