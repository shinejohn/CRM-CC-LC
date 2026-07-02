<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Models\Customer;
use App\Services\EngagementService;
use App\Services\TierManager;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

final class EvaluateTierTransitions implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /** Heavy full-table pass over ~12.9M rows — runs on the maintenance queue. */
    public function __construct()
    {
        $this->onQueue('maintenance');
    }

    public int $timeout = 3600;

    public int $tries = 1;

    public function handle(EngagementService $engagementService, TierManager $tierManager): void
    {
        // chunkById (not chunk) — chunk() uses a growing OFFSET which is O(n^2) over ~12.9M rows.
        Customer::chunkById(500, function ($customers) use ($engagementService, $tierManager) {
            foreach ($customers as $customer) {
                try {
                    $newTier = $engagementService->evaluateTierChange($customer);

                    if ($newTier !== null) {
                        if ($newTier < $customer->engagement_tier) {
                            $tierManager->upgradeTier($customer, $newTier);
                        } else {
                            $tierManager->downgradeTier($customer, $newTier);
                        }
                    }
                } catch (\Throwable $e) {
                    // A single bad row must not abort the whole run.
                    Log::warning('EvaluateTierTransitions: skipped customer', [
                        'customer_id' => $customer->id,
                        'error' => $e->getMessage(),
                    ]);
                }
            }
        });
    }
}
