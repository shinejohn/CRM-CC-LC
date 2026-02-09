<?php

namespace App\Listeners;

use App\Events\ApprovalSubmitted;
use App\Services\EngagementService;
use App\Models\Customer;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class UpdateEngagementOnApproval implements ShouldQueue
{
    use InteractsWithQueue;

    public function __construct(
        private EngagementService $engagementService
    ) {}

    public function handle(ApprovalSubmitted $event): void
    {
        $customer = Customer::find($event->customerId);
        if (!$customer) {
            return;
        }

        // Update last approval timestamp
        $customer->update(['last_approval' => now()]);

        // Recalculate engagement score (approvals are high value)
        $score = $this->engagementService->calculateScore($customer);
        $customer->update(['engagement_score' => $score]);
    }
}
