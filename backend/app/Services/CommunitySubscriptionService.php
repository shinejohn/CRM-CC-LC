<?php

namespace App\Services;

use App\Models\Community;
use App\Models\CommunitySubscription;
use App\Models\Customer;
use Illuminate\Support\Facades\Log;

class CommunitySubscriptionService
{
    private StripeService $stripeService;

    private SlotEnforcementService $slotService;

    public function __construct(StripeService $stripeService, SlotEnforcementService $slotService)
    {
        $this->stripeService = $stripeService;
        $this->slotService = $slotService;
    }

    /**
     * Create a new community subscription.
     */
    public function subscribe(
        Customer $customer,
        string $communityId,
        string $productSlug,
        string $paymentMethodId,
        ?string $categoryGroup = null,
        ?string $categorySubtype = null
    ): CommunitySubscription {
        $tier = $this->determineTier($productSlug);

        $slotReserved = false;
        if ($categoryGroup) {
            $availability = $this->slotService->checkAvailability($communityId, $categoryGroup, $categorySubtype, $tier);
            if (! $availability['available']) {
                throw new \Exception("No {$tier} slots available for {$categoryGroup}".($categorySubtype ? "/{$categorySubtype}" : '').' in this community.');
            }
            if (! $this->slotService->reserveSlot($communityId, $categoryGroup, $categorySubtype, $tier)) {
                throw new \Exception('Could not reserve a slot. Please try again.');
            }
            $slotReserved = true;
        }

        $stripeSubscription = null;

        try {
            $rate = $this->determineRate($productSlug);
            $founderInfo = $this->checkFounderEligibility($communityId);

            $stripePriceId = config("services.stripe.prices.{$productSlug}");
            if (empty($stripePriceId)) {
                throw new \InvalidArgumentException(
                    "Stripe recurring price is not configured for {$productSlug}. Set STRIPE_PRICE_".strtoupper(str_replace('-', '_', $productSlug)).' in the environment.'
                );
            }

            $stripeCustomerId = $customer->stripe_customer_id ?? null;
            if (! $stripeCustomerId) {
                $stripeCustomer = $this->stripeService->createCustomer(
                    $customer->email ?? $customer->primary_email ?? "billing-{$customer->id}@fibonacco.internal",
                    $customer->business_name ?? $customer->owner_name ?? 'Community Subscriber',
                    ['customer_id' => $customer->id]
                );
                $stripeCustomerId = $stripeCustomer->id;
                $customer->update(['stripe_customer_id' => $stripeCustomerId]);
            }

            $stripeSubscription = $this->stripeService->createSubscription(
                $stripeCustomerId,
                $stripePriceId,
                [
                    'customer_id' => $customer->id,
                    'community_id' => $communityId,
                    'product_slug' => $productSlug,
                    'tier' => $tier,
                ]
            );

            $now = now();
            $commitmentEnds = $now->copy()->addMonths(12);
            $bonusStarts = $commitmentEnds->copy();
            $bonusEnds = $bonusStarts->copy()->addMonths(3);

            $subscription = CommunitySubscription::create([
                'customer_id' => $customer->id,
                'community_id' => $communityId,
                'product_slug' => $productSlug,
                'tier' => $tier,
                'status' => 'active',
                'monthly_rate' => $rate,
                'stripe_subscription_id' => $stripeSubscription->id,
                'stripe_customer_id' => $stripeCustomerId,
                'commitment_months' => 12,
                'commitment_starts_at' => $now,
                'commitment_ends_at' => $commitmentEnds,
                'bonus_months' => 3,
                'bonus_starts_at' => $bonusStarts,
                'bonus_ends_at' => $bonusEnds,
                'next_renewal_at' => $bonusEnds,
                'is_founder_pricing' => $founderInfo['eligible'],
                'founder_lock_expires_at' => $founderInfo['eligible'] ? $now->copy()->addYears(3) : null,
                'category_group' => $categoryGroup,
                'category_subtype' => $categorySubtype,
            ]);

            return $subscription;
        } catch (\Throwable $e) {
            if ($stripeSubscription !== null) {
                try {
                    $this->stripeService->cancelSubscription($stripeSubscription->id);
                } catch (\Throwable $cancelError) {
                    Log::error('Rollback: failed to cancel Stripe subscription after local failure: '.$cancelError->getMessage());
                }
            }
            if ($slotReserved) {
                $this->slotService->releaseSlot($communityId, $categoryGroup, $categorySubtype, $tier);
            }
            throw $e;
        }
    }

    /**
     * Cancel a community subscription.
     */
    public function cancel(CommunitySubscription $sub, string $reason): CommunitySubscription
    {
        $earlyTerminationBalance = null;
        if ($sub->commitment_ends_at && $sub->commitment_ends_at->isFuture()) {
            $remainingMonths = (int) now()->diffInMonths($sub->commitment_ends_at);
            $earlyTerminationBalance = $remainingMonths * (float) $sub->monthly_rate;
        }

        if ($sub->stripe_subscription_id) {
            try {
                $this->stripeService->cancelSubscription($sub->stripe_subscription_id);
            } catch (\Exception $e) {
                Log::error('Failed to cancel Stripe subscription: '.$e->getMessage());
            }
        }

        if ($sub->category_group) {
            $this->slotService->releaseSlot(
                $sub->community_id,
                $sub->category_group,
                $sub->category_subtype,
                $sub->tier
            );
        }

        $sub->update([
            'status' => 'cancelled',
            'cancelled_at' => now(),
            'cancellation_reason' => $reason,
            'early_termination_balance' => $earlyTerminationBalance,
        ]);

        return $sub->fresh();
    }

    /**
     * Check founder pricing eligibility for a community.
     */
    public function checkFounderEligibility(string $communityId): array
    {
        $community = Community::find($communityId);

        if (! $community || ! $community->launched_at) {
            return [
                'eligible' => true,
                'days_remaining' => null,
                'window_closes_at' => null,
                'reason' => 'Community not yet launched — founder pricing available',
            ];
        }

        $windowDays = $community->founder_window_days ?? 90;
        $windowCloses = $community->launched_at->copy()->addDays($windowDays);
        $eligible = now()->lt($windowCloses);
        $daysRemaining = $eligible
            ? max(0, (int) now()->startOfDay()->diffInDays($windowCloses->copy()->startOfDay(), false))
            : 0;

        return [
            'eligible' => $eligible,
            'days_remaining' => $eligible ? $daysRemaining : 0,
            'window_closes_at' => $windowCloses->toIso8601String(),
            'reason' => $eligible
                ? "Founder pricing available for {$daysRemaining} more days"
                : 'Founder pricing window has closed',
        ];
    }

    /**
     * Determine the subscription tier from a product slug.
     */
    private function determineTier(string $productSlug): string
    {
        return match ($productSlug) {
            'community-influencer' => 'influencer',
            'community-expert' => 'expert',
            'community-sponsor' => 'sponsor',
            'community-reporter' => 'reporter',
            default => 'influencer',
        };
    }

    /**
     * Determine the monthly rate for a product slug.
     */
    private function determineRate(string $productSlug): float
    {
        return match ($productSlug) {
            'community-influencer' => 300.00,
            'community-expert' => 100.00,
            'community-sponsor' => 300.00,
            'community-reporter' => 100.00,
            default => 300.00,
        };
    }
}
