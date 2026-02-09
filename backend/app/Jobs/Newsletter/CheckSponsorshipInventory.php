<?php

namespace App\Jobs\Newsletter;

use App\Models\Newsletter\Sponsorship;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class CheckSponsorshipInventory implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle(): void
    {
        $lowInventory = Sponsorship::where('status', 'active')
            ->whereRaw('(impressions_delivered::float / NULLIF(impressions_purchased, 0)) > 0.8')
            ->whereRaw('impressions_delivered < impressions_purchased')
            ->get();
        
        foreach ($lowInventory as $sponsorship) {
            $percentage = ($sponsorship->impressions_delivered / $sponsorship->impressions_purchased) * 100;
            
            Log::warning('Sponsorship inventory low', [
                'sponsorship_id' => $sponsorship->id,
                'sponsor_id' => $sponsorship->sponsor_id,
                'delivered' => $sponsorship->impressions_delivered,
                'purchased' => $sponsorship->impressions_purchased,
                'percentage' => round($percentage, 2),
            ]);
            
            // TODO: Send alert to admin/sponsor
        }
    }
}



