<?php

namespace App\Listeners;

use App\Events\TrialAccepted;
use App\Services\PipelineTransitionService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;

class AdvanceStageOnTrialAcceptance implements ShouldQueue
{
    use InteractsWithQueue;

    public function __construct(
        protected PipelineTransitionService $transitionService
    ) {}

    /**
     * Handle the event.
     */
    public function handle(TrialAccepted $event): void
    {
        try {
            Log::info("AdvanceStageOnTrialAcceptance: Processing trial acceptance", [
                'customer_id' => $event->customer->id,
                'trial_duration_days' => $event->trialDurationDays,
            ]);

            // Handle trial acceptance (starts trial, assigns timeline)
            $this->transitionService->handleTrialAcceptance($event->customer);

        } catch (\Exception $e) {
            Log::error("AdvanceStageOnTrialAcceptance: Error processing event", [
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
    public function failed(TrialAccepted $event, \Throwable $exception): void
    {
        Log::error("AdvanceStageOnTrialAcceptance: Job failed permanently", [
            'customer_id' => $event->customer->id,
            'error' => $exception->getMessage(),
        ]);
    }
}

