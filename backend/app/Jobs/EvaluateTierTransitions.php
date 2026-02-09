<?php

namespace App\Jobs;

use App\Models\Customer;
use App\Services\EngagementService;
use App\Services\TierManager;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class EvaluateTierTransitions implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle(EngagementService $engagementService, TierManager $tierManager): void
    {
        Customer::chunk(100, function ($customers) use ($engagementService, $tierManager) {
            foreach ($customers as $customer) {
                $newTier = $engagementService->evaluateTierChange($customer);
                
                if ($newTier !== null) {
                    if ($newTier < $customer->engagement_tier) {
                        $tierManager->upgradeTier($customer, $newTier);
                    } else {
                        $tierManager->downgradeTier($customer, $newTier);
                    }
                }
            }
        });
    }
}
