<?php

namespace App\Listeners;

use App\Events\EmailClicked;
use App\Services\EngagementService;
use App\Models\Customer;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class UpdateEngagementOnEmailClick implements ShouldQueue
{
    use InteractsWithQueue;

    public function __construct(
        private EngagementService $engagementService
    ) {}

    public function handle(EmailClicked $event): void
    {
        $customer = Customer::find($event->customerId);
        if (!$customer) {
            return;
        }

        // Update last email click timestamp
        $customer->update(['last_email_click' => now()]);

        // Recalculate engagement score
        $score = $this->engagementService->calculateScore($customer);
        $customer->update(['engagement_score' => $score]);
    }
}
