<?php

namespace App\Services;

use App\Models\CommunitySlotLimit;
use Illuminate\Support\Facades\DB;

class SlotEnforcementService
{
    /**
     * Community ceiling: maximum total influencer slots across all categories.
     */
    private const COMMUNITY_CEILING = 37;

    /**
     * Check if a slot is available for a given category in a community.
     */
    public function checkAvailability(
        string $communityId,
        string $categoryGroup,
        ?string $categorySubtype,
        string $tier = 'influencer'
    ): array {
        $slot = CommunitySlotLimit::where('community_id', $communityId)
            ->where('category_group', $categoryGroup)
            ->where('category_subtype', $categorySubtype)
            ->first();

        if (! $slot) {
            return [
                'available' => false,
                'reason' => 'No slot limits configured for this category',
                'remaining' => 0,
                'max' => 0,
            ];
        }

        if ($tier === 'expert') {
            $remaining = $slot->expertSlotsRemaining();

            return [
                'available' => $remaining > 0,
                'remaining' => $remaining,
                'max' => $slot->max_expert_slots,
                'current' => $slot->current_expert_count,
            ];
        }

        // Check influencer slots
        $remaining = $slot->influencerSlotsRemaining();

        // Also check community ceiling
        $totalInfluencers = CommunitySlotLimit::where('community_id', $communityId)
            ->sum('current_influencer_count');

        $ceilingRemaining = max(0, self::COMMUNITY_CEILING - $totalInfluencers);

        return [
            'available' => $remaining > 0 && $ceilingRemaining > 0,
            'remaining' => min($remaining, $ceilingRemaining),
            'max' => $slot->max_influencer_slots,
            'current' => $slot->current_influencer_count,
            'community_ceiling_remaining' => $ceilingRemaining,
        ];
    }

    /**
     * Reserve a slot using row-level locking to prevent race conditions.
     */
    public function reserveSlot(
        string $communityId,
        string $categoryGroup,
        ?string $categorySubtype,
        string $tier = 'influencer'
    ): bool {
        return DB::transaction(function () use ($communityId, $categoryGroup, $categorySubtype, $tier) {
            $slot = CommunitySlotLimit::where('community_id', $communityId)
                ->where('category_group', $categoryGroup)
                ->where('category_subtype', $categorySubtype)
                ->lockForUpdate()
                ->first();

            if (! $slot) {
                return false;
            }

            if ($tier === 'expert') {
                if ($slot->expertSlotsRemaining() <= 0) {
                    return false;
                }
                $slot->increment('current_expert_count');

                return true;
            }

            // Check both category limit and community ceiling
            if ($slot->influencerSlotsRemaining() <= 0) {
                return false;
            }

            $totalInfluencers = CommunitySlotLimit::where('community_id', $communityId)
                ->sum('current_influencer_count');

            if ($totalInfluencers >= self::COMMUNITY_CEILING) {
                return false;
            }

            $slot->increment('current_influencer_count');

            return true;
        });
    }

    /**
     * Release a slot when a subscription is cancelled.
     */
    public function releaseSlot(
        string $communityId,
        string $categoryGroup,
        ?string $categorySubtype,
        string $tier = 'influencer'
    ): bool {
        return DB::transaction(function () use ($communityId, $categoryGroup, $categorySubtype, $tier) {
            $slot = CommunitySlotLimit::where('community_id', $communityId)
                ->where('category_group', $categoryGroup)
                ->where('category_subtype', $categorySubtype)
                ->lockForUpdate()
                ->first();

            if (! $slot) {
                return false;
            }

            $column = $tier === 'expert' ? 'current_expert_count' : 'current_influencer_count';

            if ($slot->$column > 0) {
                $slot->decrement($column);
            }

            return true;
        });
    }

    /**
     * Get a full availability overview for all categories in a community.
     */
    public function getAvailabilityOverview(string $communityId): array
    {
        $slots = CommunitySlotLimit::where('community_id', $communityId)
            ->orderBy('category_group')
            ->orderBy('category_subtype')
            ->get();

        $totalInfluencers = $slots->sum('current_influencer_count');

        $categories = [];
        foreach ($slots as $slot) {
            $categories[] = [
                'category_group' => $slot->category_group,
                'category_subtype' => $slot->category_subtype,
                'influencer' => [
                    'max' => $slot->max_influencer_slots,
                    'current' => $slot->current_influencer_count,
                    'remaining' => $slot->influencerSlotsRemaining(),
                ],
                'expert' => [
                    'max' => $slot->max_expert_slots,
                    'current' => $slot->current_expert_count,
                    'remaining' => $slot->expertSlotsRemaining(),
                ],
            ];
        }

        return [
            'community_id' => $communityId,
            'community_ceiling' => self::COMMUNITY_CEILING,
            'total_influencers' => $totalInfluencers,
            'ceiling_remaining' => max(0, self::COMMUNITY_CEILING - $totalInfluencers),
            'categories' => $categories,
        ];
    }
}
