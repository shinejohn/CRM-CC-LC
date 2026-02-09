<?php

namespace App\Events;

use App\Models\Customer;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class EngagementThresholdReached
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public Customer $customer,
        public int $previousScore,
        public int $newScore,
        public string $thresholdType // 'high', 'medium', 'low'
    ) {}
}

