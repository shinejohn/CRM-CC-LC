<?php

namespace App\Listeners;

use App\Events\EmailNotOpened;
use App\Services\EmailFollowupService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;

class HandleEmailNotOpened implements ShouldQueue
{
    use InteractsWithQueue;

    public function __construct(
        protected EmailFollowupService $followupService
    ) {}

    /**
     * Handle the event.
     */
    public function handle(EmailNotOpened $event): void
    {
        try {
            Log::info("HandleEmailNotOpened: Processing unopened email", [
                'customer_id' => $event->customer->id,
                'campaign_send_id' => $event->campaignSend->id,
                'hours_since_sent' => $event->hoursSinceSent,
            ]);

            // Delegate to follow-up service
            $this->followupService->handleUnopenedEmail(
                customer: $event->customer,
                campaignSend: $event->campaignSend,
                hoursSinceSent: $event->hoursSinceSent
            );

        } catch (\Exception $e) {
            Log::error("HandleEmailNotOpened: Error processing event", [
                'customer_id' => $event->customer->id,
                'campaign_send_id' => $event->campaignSend->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            // Re-throw to allow queue retry mechanism
            throw $e;
        }
    }

    /**
     * Handle a job failure.
     */
    public function failed(EmailNotOpened $event, \Throwable $exception): void
    {
        Log::error("HandleEmailNotOpened: Job failed permanently", [
            'customer_id' => $event->customer->id,
            'campaign_send_id' => $event->campaignSend->id,
            'error' => $exception->getMessage(),
        ]);
    }
}

