<?php

namespace App\Jobs;

use App\Models\Customer;
use App\Services\SMBCampaignService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class AdvanceManifestDestinyDay implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle(SMBCampaignService $service): void
    {
        Customer::where('campaign_status', 'running')
            ->whereNotNull('manifest_destiny_day')
            ->chunk(100, function ($customers) use ($service) {
                foreach ($customers as $customer) {
                    $service->advanceDay($customer);
                }
            });
    }
}
