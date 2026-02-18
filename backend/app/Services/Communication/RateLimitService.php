<?php

namespace App\Services\Communication;

use App\Models\Communication\RateLimit;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\Cache;

class RateLimitService
{
    private const REDIS_PREFIX = 'comm:rate:';

    public function canSend(string $limitType, string $limitKey): bool
    {
        $rateLimit = RateLimit::where('limit_type', $limitType)
            ->where('limit_key', $limitKey)
            ->where('is_active', true)
            ->first();
        
        if (!$rateLimit) {
            return true; // No limit configured
        }
        
        // Check per-second limit
        if ($rateLimit->max_per_second) {
            $key = self::REDIS_PREFIX . "{$limitType}:{$limitKey}:second";
            $current = (int) Redis::get($key) ?? 0;
            if ($current >= $rateLimit->max_per_second) {
                return false;
            }
        }
        
        // Check per-minute limit
        if ($rateLimit->max_per_minute) {
            $key = self::REDIS_PREFIX . "{$limitType}:{$limitKey}:minute";
            $current = (int) Redis::get($key) ?? 0;
            if ($current >= $rateLimit->max_per_minute) {
                return false;
            }
        }
        
        // Check per-hour limit
        if ($rateLimit->max_per_hour) {
            $key = self::REDIS_PREFIX . "{$limitType}:{$limitKey}:hour";
            $current = (int) Redis::get($key) ?? 0;
            if ($current >= $rateLimit->max_per_hour) {
                return false;
            }
        }
        
        // Check per-day limit
        if ($rateLimit->max_per_day) {
            $key = self::REDIS_PREFIX . "{$limitType}:{$limitKey}:day";
            $current = (int) Redis::get($key) ?? 0;
            if ($current >= $rateLimit->max_per_day) {
                return false;
            }
        }
        
        return true;
    }

    public function recordSend(string $limitType, string $limitKey): void
    {
        $rateLimit = RateLimit::where('limit_type', $limitType)
            ->where('limit_key', $limitKey)
            ->where('is_active', true)
            ->first();
        
        if (!$rateLimit) {
            return;
        }
        
        // Increment counters in Redis
        if ($rateLimit->max_per_second) {
            $key = self::REDIS_PREFIX . "{$limitType}:{$limitKey}:second";
            Redis::incr($key);
            Redis::expire($key, 1);
        }
        
        if ($rateLimit->max_per_minute) {
            $key = self::REDIS_PREFIX . "{$limitType}:{$limitKey}:minute";
            Redis::incr($key);
            Redis::expire($key, 60);
        }
        
        if ($rateLimit->max_per_hour) {
            $key = self::REDIS_PREFIX . "{$limitType}:{$limitKey}:hour";
            Redis::incr($key);
            Redis::expire($key, 3600);
        }
        
        if ($rateLimit->max_per_day) {
            $key = self::REDIS_PREFIX . "{$limitType}:{$limitKey}:day";
            Redis::incr($key);
            Redis::expire($key, 86400);
        }
    }
}
