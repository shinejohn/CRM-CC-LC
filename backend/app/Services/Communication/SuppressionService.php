<?php

namespace App\Services\Communication;

use App\Models\Communication\SuppressionList;
use Illuminate\Support\Facades\Cache;

class SuppressionService
{
    private const CACHE_TTL = 3600; // 1 hour

    public function isSuppressed(string $channel, string $address, ?int $communityId = null): bool
    {
        $cacheKey = "suppression:{$channel}:{$address}:" . ($communityId ?? 'global');
        
        return Cache::remember($cacheKey, self::CACHE_TTL, function () use ($channel, $address, $communityId) {
            // Check global suppression
            $globalSuppressed = SuppressionList::where('channel', $channel)
                ->where('address', $address)
                ->whereNull('community_id')
                ->where(function ($query) {
                    $query->whereNull('expires_at')
                        ->orWhere('expires_at', '>', now());
                })
                ->exists();
            
            if ($globalSuppressed) {
                return true;
            }
            
            // Check community-specific suppression
            if ($communityId !== null) {
                return SuppressionList::where('channel', $channel)
                    ->where('address', $address)
                    ->where('community_id', $communityId)
                    ->where(function ($query) {
                        $query->whereNull('expires_at')
                            ->orWhere('expires_at', '>', now());
                    })
                    ->exists();
            }
            
            return false;
        });
    }

    public function addSuppression(
        string $channel,
        string $address,
        string $reason,
        ?string $source = null,
        ?int $communityId = null,
        ?\Carbon\Carbon $expiresAt = null
    ): void {
        SuppressionList::updateOrCreate(
            [
                'channel' => $channel,
                'address' => $address,
                'community_id' => $communityId,
            ],
            [
                'reason' => $reason,
                'source' => $source,
                'expires_at' => $expiresAt,
            ]
        );
        
        // Clear cache
        $cacheKey = "suppression:{$channel}:{$address}:" . ($communityId ?? 'global');
        Cache::forget($cacheKey);
    }
}
