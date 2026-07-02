<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Models\Customer;
use App\Services\EngagementService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

final class RecalculateEngagementScores implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /** Heavy full-table pass over ~12.9M rows — runs on the maintenance queue. */
    public function __construct()
    {
        $this->onQueue('maintenance');
    }

    public int $timeout = 3600;

    public int $tries = 1;

    public function handle(EngagementService $service): void
    {
        // chunkById (not chunk) — chunk() uses a growing OFFSET which is O(n^2) over ~12.9M rows.
        Customer::chunkById(500, function ($customers) use ($service) {
            foreach ($customers as $customer) {
                try {
                    $score = $service->calculateScore($customer);
                    $customer->update(['engagement_score' => $score]);
                } catch (\Throwable $e) {
                    // A single bad row must not abort the whole run.
                    Log::warning('RecalculateEngagementScores: skipped customer', [
                        'customer_id' => $customer->id,
                        'error' => $e->getMessage(),
                    ]);
                }
            }
        });
    }
}
