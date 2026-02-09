<?php

namespace App\Listeners;

use App\Events\ContentViewed;
use App\Services\EngagementService;
use App\Models\Customer;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class UpdateEngagementOnContentView implements ShouldQueue
{
    use InteractsWithQueue;

    public function __construct(
        private EngagementService $engagementService
    ) {}

    public function handle(ContentViewed $event): void
    {
        $customer = Customer::find($event->customerId);
        if (!$customer) {
            return;
        }

        // Update last content view timestamp
        $customer->update(['last_content_view' => now()]);

        // Recalculate engagement score
        $score = $this->engagementService->calculateScore($customer);
        $customer->update(['engagement_score' => $score]);
    }
}
