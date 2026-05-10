<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Models\SyndicationPartner;
use App\Services\SyndicationService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

final class RecalculateSyndicationEarnings implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $timeout = 120;

    public function handle(SyndicationService $syndicationService): void
    {
        $partners = SyndicationPartner::where('status', 'active')->get();

        foreach ($partners as $partner) {
            try {
                $syndicationService->updateTier($partner);
                $syndicationService->matchSponsors($partner);
            } catch (\Throwable $e) {
                Log::error("Failed to recalculate for partner {$partner->name}: {$e->getMessage()}");
            }
        }

        Log::info("Syndication earnings recalculation complete for {$partners->count()} partners");
    }
}
