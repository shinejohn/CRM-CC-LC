<?php

namespace App\Services;

use App\Models\Customer;
use App\Jobs\QueueNextCampaign;

class SMBCampaignService
{
    /**
     * Start Manifest Destiny campaign for customer
     */
    public function startCampaign(Customer $customer): void
    {
        $customer->update([
            'campaign_status' => 'running',
            'manifest_destiny_day' => 1,
            'manifest_destiny_start_date' => now()->toDateString(),
            'next_scheduled_send' => now()->addDay(),
        ]);

        // Queue first campaign send
        QueueNextCampaign::dispatch($customer->id);
    }

    /**
     * Pause campaign (manual or automatic)
     */
    public function pauseCampaign(Customer $customer, string $reason): void
    {
        // Store pause reason in notes field
        $notes = $customer->notes ?? '';
        $pauseNote = "\n[Campaign Paused: " . now()->toDateTimeString() . "] Reason: " . $reason;
        
        $customer->update([
            'campaign_status' => 'paused',
            'notes' => $notes . $pauseNote,
        ]);
    }

    /**
     * Resume paused campaign
     */
    public function resumeCampaign(Customer $customer): void
    {
        $customer->update([
            'campaign_status' => 'running',
        ]);

        // Queue next campaign send
        QueueNextCampaign::dispatch($customer->id);
    }

    /**
     * Advance to next day in campaign
     */
    public function advanceDay(Customer $customer): void
    {
        $newDay = ($customer->manifest_destiny_day ?? 0) + 1;

        if ($newDay > 90) {
            $customer->update([
                'campaign_status' => 'completed',
                'manifest_destiny_day' => 90,
            ]);
        } else {
            $customer->update([
                'manifest_destiny_day' => $newDay,
                'next_scheduled_send' => now()->addDay(),
            ]);
        }
    }
}

