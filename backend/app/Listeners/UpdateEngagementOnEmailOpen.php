<?php

namespace App\Listeners;

use App\Events\EmailOpened;
use App\Services\EngagementService;
use App\Models\Customer;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class UpdateEngagementOnEmailOpen implements ShouldQueue
{
    use InteractsWithQueue;

    public function __construct(
        private EngagementService $engagementService
    ) {}

    public function handle(EmailOpened $event): void
    {
        $customer = Customer::find($event->customerId);
        if (!$customer) {
            return;
        }

        // Update last email open timestamp
        $customer->update(['last_email_open' => now()]);

        // Recalculate engagement score
        $score = $this->engagementService->calculateScore($customer);
        $customer->update(['engagement_score' => $score]);
    }
}
