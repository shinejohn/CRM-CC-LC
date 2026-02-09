<?php

namespace App\Jobs;

use App\Models\Customer;
use App\Services\EngagementService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class RecalculateEngagementScores implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle(EngagementService $service): void
    {
        Customer::chunk(100, function ($customers) use ($service) {
            foreach ($customers as $customer) {
                $score = $service->calculateScore($customer);
                $customer->update(['engagement_score' => $score]);
            }
        });
    }
}
