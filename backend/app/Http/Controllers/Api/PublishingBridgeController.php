<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CommunitySubscription;
use App\Services\Pitch\SlotInventoryService;

final class PublishingBridgeController extends Controller
{
    private SlotInventoryService $slotService;

    public function __construct(SlotInventoryService $slotService)
    {
        $this->slotService = $slotService;
    }

    /**
     * Health-check endpoint. Validates bridge auth is configured and the key matches.
     * Call this at boot/deploy to catch misconfigured keys before any real job runs.
     */
    public function ping()
    {
        return response()->json([
            'status' => 'ok',
            'service' => 'command-center',
            'timestamp' => now()->toIso8601String(),
        ]);
    }

    /**
     * Get subscription status for a business in a community.
     * Called by Multisite to check what a business is entitled to.
     */
    public function subscriptionStatus(string $externalId, string $communityId)
    {
        // Look up customer by external_id (the Multisite SMB ID)
        $subscription = CommunitySubscription::whereHas('customer', function ($q) use ($externalId) {
            $q->where('external_id', $externalId);
        })
            ->where('community_id', $communityId)
            ->where('status', 'active')
            ->first();

        if (! $subscription) {
            return response()->json([
                'data' => [
                    'tier' => null,
                    'is_active' => false,
                    'is_founder' => false,
                    'badge_type' => null,
                    'monthly_rate' => 0,
                    'section_sponsorship' => null,
                    'content_quotas' => $this->defaultQuotas(),
                ],
            ]);
        }

        return response()->json([
            'data' => [
                'tier' => $subscription->tier,
                'is_active' => true,
                'is_founder' => $subscription->isFounderPricing(),
                'badge_type' => $this->determineBadgeType($subscription),
                'monthly_rate' => $subscription->monthly_rate,
                'section_sponsorship' => $subscription->sponsored_section,
                'content_quotas' => $this->quotasForTier($subscription->tier),
            ],
        ]);
    }

    /**
     * Get all active sponsors for a community.
     */
    public function communitySponsors(string $communityId)
    {
        $sponsors = CommunitySubscription::where('community_id', $communityId)
            ->where('status', 'active')
            ->where('tier', 'sponsor')
            ->with('customer')
            ->get()
            ->map(function ($sub) {
                return [
                    'section' => $sub->sponsored_section,
                    'business_name' => $sub->customer->business_name ?? $sub->customer->name ?? '',
                    'logo_url' => $sub->customer->logo_url ?? null,
                    'tagline' => $sub->customer->tagline ?? null,
                    'cta_url' => $sub->customer->website ?? null,
                ];
            });

        return response()->json(['data' => $sponsors]);
    }

    /**
     * Get all active influencers for a community.
     */
    public function activeInfluencers(string $communityId)
    {
        $influencers = CommunitySubscription::where('community_id', $communityId)
            ->where('status', 'active')
            ->whereIn('tier', ['influencer', 'expert', 'reporter'])
            ->with('customer')
            ->get()
            ->map(function ($sub) {
                return [
                    'business_external_id' => $sub->customer->external_id ?? null,
                    'business_name' => $sub->customer->business_name ?? $sub->customer->name ?? '',
                    'category' => $sub->category_group,
                    'tier' => $sub->tier,
                    'badge_type' => $this->determineBadgeType($sub),
                    'logo_url' => $sub->customer->logo_url ?? null,
                ];
            });

        return response()->json(['data' => $influencers]);
    }

    /**
     * Get slot availability for a community.
     */
    public function slotAvailability(string $communityId)
    {
        $overview = $this->slotService->getAvailabilityOverview($communityId);

        return response()->json(['data' => $overview]);
    }

    /**
     * Determine the badge type based on subscription tier and founder status.
     */
    private function determineBadgeType(CommunitySubscription $sub): string
    {
        $badge = $sub->tier;

        if ($sub->isFounderPricing()) {
            $badge = "founder_{$badge}";
        }

        return $badge;
    }

    /**
     * Content quotas per tier.
     */
    private function quotasForTier(string $tier): array
    {
        return match ($tier) {
            'influencer' => ['ads' => 2, 'classifieds' => 2, 'announcements' => 2, 'coupons' => 3, 'story_mentions' => 20],
            'expert' => ['ads' => 3, 'classifieds' => 3, 'announcements' => 3, 'coupons' => 5, 'story_mentions' => 30],
            'sponsor' => ['ads' => 5, 'classifieds' => 5, 'announcements' => 5, 'coupons' => 10, 'story_mentions' => 50],
            'reporter' => ['ads' => 1, 'classifieds' => 1, 'announcements' => 5, 'coupons' => 1, 'story_mentions' => 10],
            default => $this->defaultQuotas(),
        };
    }

    /**
     * Default quotas for non-subscribers.
     */
    private function defaultQuotas(): array
    {
        return ['ads' => 0, 'classifieds' => 0, 'announcements' => 0, 'coupons' => 0, 'story_mentions' => 0];
    }
}
