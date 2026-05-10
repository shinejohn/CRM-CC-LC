<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Models\Community;
use App\Services\ContentCardService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

final class GenerateDailyContentCards implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $timeout = 300;

    public function handle(ContentCardService $contentCardService): void
    {
        $communities = Community::all();
        $total = 0;

        foreach ($communities as $community) {
            try {
                $count = $contentCardService->generateDailyCards($community);
                $total += $count;
            } catch (\Throwable $e) {
                Log::error("Failed to generate cards for community {$community->name}: {$e->getMessage()}");
            }
        }

        Log::info("Daily content card generation complete: {$total} cards created");
    }
}
