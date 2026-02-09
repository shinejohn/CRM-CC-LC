<?php

namespace App\Listeners;

use App\Events\CallbackReceived;
use App\Services\EngagementService;
use App\Models\Customer;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class UpdateEngagementOnCallback implements ShouldQueue
{
    use InteractsWithQueue;

    public function __construct(
        private EngagementService $engagementService
    ) {}

    public function handle(CallbackReceived $event): void
    {
        $customer = Customer::find($event->customerId);
        if (!$customer) {
            return;
        }

        // Recalculate engagement score (callbacks are high engagement)
        $score = $this->engagementService->calculateScore($customer);
        $customer->update(['engagement_score' => $score]);
    }
}
