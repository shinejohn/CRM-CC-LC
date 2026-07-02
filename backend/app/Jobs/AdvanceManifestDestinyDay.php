<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Models\Customer;
use App\Services\SMBCampaignService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

final class AdvanceManifestDestinyDay implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /** Heavy daily batch (~385K enrolled) — runs on the maintenance queue. */
    public function __construct()
    {
        $this->onQueue('maintenance');
    }

    public int $timeout = 3600;

    public int $tries = 1;

    public function handle(SMBCampaignService $service): void
    {
        // chunkById (not chunk): advanceDay() flips campaign_status to 'completed', which removes
        // rows from the WHERE filter mid-iteration. With OFFSET-based chunk() that shifts remaining
        // rows forward and silently skips customers. chunkById pages by id > lastId, so it is stable.
        Customer::where('campaign_status', 'running')
            ->whereNotNull('manifest_destiny_day')
            ->chunkById(500, function ($customers) use ($service) {
                foreach ($customers as $customer) {
                    try {
                        $service->advanceDay($customer);
                    } catch (\Throwable $e) {
                        // A single bad row must not abort the whole run.
                        Log::warning('AdvanceManifestDestinyDay: skipped customer', [
                            'customer_id' => $customer->id,
                            'error' => $e->getMessage(),
                        ]);
                    }
                }
            });
    }
}
