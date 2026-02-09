<?php

namespace App\Jobs;

use App\Models\Customer;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class RecalculateDataQuality implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle(): void
    {
        Customer::chunk(100, function ($customers) {
            foreach ($customers as $customer) {
                $score = $this->calculateDataQuality($customer);
                $customer->update(['data_quality_score' => $score]);
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
