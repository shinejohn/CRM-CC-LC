<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Models\Customer;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

final class RecalculateDataQuality implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /** Heavy full-table pass over ~12.9M rows — runs on the maintenance queue. */
    public function __construct()
    {
        $this->onQueue('maintenance');
    }

    public int $timeout = 3600;

    public int $tries = 1;

    public function handle(): void
    {
        // chunkById (not chunk) — chunk() uses a growing OFFSET which is O(n^2) over ~12.9M rows.
        Customer::chunkById(500, function ($customers) {
            foreach ($customers as $customer) {
                try {
                    $score = $this->calculateDataQuality($customer);
                    $customer->update(['data_quality_score' => $score]);
                } catch (\Throwable $e) {
                    // A single bad row must not abort the whole run.
                    Log::warning('RecalculateDataQuality: skipped customer', [
                        'customer_id' => $customer->id,
                        'error' => $e->getMessage(),
                    ]);
                }
            }
        });
    }

    private function calculateDataQuality(Customer $customer): int
    {
        $score = 0;
        $fields = [
            'business_name' => 10,
            'email' => 15,
            'phone' => 15,
            'address_line1' => 10,
            'city' => 10,
            'state' => 10,
            'industry_category' => 10,
            'business_description' => 10,
            'products_services' => 10,
        ];

        foreach ($fields as $field => $points) {
            if (!empty($customer->$field)) {
                $score += $points;
            }
        }

        return min($score, 100);
    }
}
