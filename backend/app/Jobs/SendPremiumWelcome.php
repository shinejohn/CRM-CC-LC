<?php

namespace App\Jobs;

use App\Models\Customer;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class SendPremiumWelcome implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public string $customerId
    ) {}

    public function handle(): void
    {
        $customer = Customer::find($this->customerId);
        
        if (!$customer || $customer->engagement_tier !== 1) {
            return;
        }

        // TODO: Send premium welcome email from Sarah
        // This will be implemented in Module 2 (Email/Outbound)
    }
}
