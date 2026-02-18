<?php

namespace App\Jobs\Communication;

use App\Models\Communication\RateLimit;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Redis;

class PersistRateLimitCounters implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    private const REDIS_PREFIX = 'comm:rate:';

    public function handle(): void
    {
        $rateLimits = RateLimit::where('is_active', true)->get();
        
        foreach ($rateLimits as $rateLimit) {
            $key = self::REDIS_PREFIX . "{$rateLimit->limit_type}:{$rateLimit->limit_key}:hour";
            $currentHour = (int) Redis::get($key) ?? 0;
            
            $key = self::REDIS_PREFIX . "{$rateLimit->limit_type}:{$rateLimit->limit_key}:day";
            $currentDay = (int) Redis::get($key) ?? 0;
            
            $rateLimit->update([
                'current_hour_count' => $currentHour,
                'current_day_count' => $currentDay,
            ]);
        }
    }
}
