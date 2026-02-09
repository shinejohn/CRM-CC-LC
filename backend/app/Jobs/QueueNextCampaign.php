<?php

namespace App\Jobs;

use App\Models\Customer;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class QueueNextCampaign implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public string $customerId
    ) {}

    public function handle(): void
    {
        $customer = Customer::find($this->customerId);
        
        if (!$customer || $customer->campaign_status !== 'running') {
            return;
        }

        // TODO: Queue actual campaign send job from Module 2
        // For now, just advance the day
        $service = app(\App\Services\SMBCampaignService::class);
        $service->advanceDay($customer);
    }
}
