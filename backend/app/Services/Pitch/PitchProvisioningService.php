<?php

declare(strict_types=1);

namespace App\Services\Pitch;

use App\Models\CampaignTimeline;
use App\Models\CommunitySubscription;
use App\Models\PitchSession;
use App\Models\ProvisioningTask;
use App\Services\CampaignOrchestratorService;
use App\Services\CommunitySubscriptionService;
use App\Services\PublishingPlatformService;
use Illuminate\Support\Facades\Log;

/**
 * Orchestrates everything that happens after a pitch-engine payment succeeds.
 *
 * Called from CheckoutController::confirmPayment() after the Campaign record is created.
 *
 *  1. Claims a category slot (via SlotInventoryService through CommunitySubscriptionService)
 *  2. Creates a CommunitySubscription
 *  3. Provisions on the Publishing Platform (DTG listing, AlphaSite)
 *  4. Starts the onboarding timeline
 *  5. Creates ProvisioningTask records for tracking
 */
final class PitchProvisioningService
{
    public function __construct(
        private readonly SlotInventoryService $slotService,
        private readonly CommunitySubscriptionService $subscriptionService,
        private readonly PublishingPlatformService $publishingService,
        private readonly CampaignOrchestratorService $orchestrator,
    ) {}

    /**
     * Provision everything after a successful pitch payment.
     *
     * @return array{subscription: CommunitySubscription|null, tasks: list<ProvisioningTask>, errors: list<string>}
     */
    public function provision(PitchSession $session, string $paymentIntentId): array
    {
        $customer = $session->customer;
        $smb = $session->smb;
        $community = $session->community;
        $errors = [];
        $tasks = [];

        if (! $customer || ! $community) {
            Log::error('PitchProvisioning: missing customer or community', [
                'session_id' => $session->id,
            ]);

            return ['subscription' => null, 'tasks' => [], 'errors' => ['Missing customer or community']];
        }

        $categoryGroup = $smb?->category_group ?? $session->business_category ?? null;
        $categorySubtype = $smb?->category_subtype ?? null;

        // ── 1. Claim slot ────────────────────────────────────────
        $slotReserved = false;
        if ($categoryGroup) {
            $availability = $this->slotService->checkAvailability(
                (string) $community->id,
                $categoryGroup,
                $categorySubtype,
            );

            if ($availability['available']) {
                $slotReserved = $this->slotService->reserveSlot(
                    (string) $community->id,
                    $categoryGroup,
                    $categorySubtype,
                );
            }

            if (! $slotReserved) {
                Log::warning('PitchProvisioning: slot unavailable (race condition or full), flagging for manual review', [
                    'session_id' => $session->id,
                    'category' => $categoryGroup,
                ]);
                $errors[] = 'Slot unavailable — flagged for manual review';
            }
        }

        // ── 2. Create CommunitySubscription ──────────────────────
        $subscription = null;
        try {
            $products = $session->products_accepted ?? [];
            $productSlug = $this->resolveProductSlug($products);
            $tier = $this->resolveTier($productSlug);

            $founderInfo = $this->subscriptionService->checkFounderEligibility((string) $community->id);

            $now = now();
            $subscription = CommunitySubscription::create([
                'customer_id' => $customer->id,
                'community_id' => $community->id,
                'product_slug' => $productSlug,
                'tier' => $tier,
                'status' => 'active',
                'monthly_rate' => $this->resolveRate($productSlug),
                'commitment_months' => 12,
                'commitment_starts_at' => $now,
                'commitment_ends_at' => $now->copy()->addMonths(12),
                'bonus_months' => 3,
                'bonus_starts_at' => $now->copy()->addMonths(12),
                'bonus_ends_at' => $now->copy()->addMonths(15),
                'next_renewal_at' => $now->copy()->addMonths(15),
                'is_founder_pricing' => $founderInfo['eligible'],
                'founder_lock_expires_at' => $founderInfo['eligible'] ? $now->copy()->addYears(3) : null,
                'category_group' => $categoryGroup,
                'category_subtype' => $categorySubtype,
            ]);

            $tasks[] = $this->createTask($session, 'create_subscription', 'completed', [
                'subscription_id' => $subscription->id,
                'tier' => $tier,
            ]);
        } catch (\Throwable $e) {
            Log::error('PitchProvisioning: subscription creation failed', [
                'session_id' => $session->id,
                'error' => $e->getMessage(),
            ]);
            $errors[] = 'Subscription creation failed: ' . $e->getMessage();
            $tasks[] = $this->createTask($session, 'create_subscription', 'failed', [
                'error' => $e->getMessage(),
            ]);
        }

        // ── 3. Provision on Publishing Platform ──────────────────
        $businessName = $smb?->business_name ?? $session->business_name ?? 'Business';

        // DTG listing
        try {
            $listingResult = $this->publishingService->createListing([
                'business_name' => $businessName,
                'community_id' => $community->id,
                'external_id' => $customer->external_id ?? $customer->id,
                'category' => $categoryGroup ?? 'general',
                'description' => $smb?->description ?? '',
                'address' => $smb?->address ?? '',
                'city' => $smb?->city ?? $community->name ?? '',
                'state' => $smb?->state ?? $community->state ?? '',
                'phone' => $smb?->phone ?? $customer->phone ?? '',
                'email' => $customer->email ?? '',
                'website' => $smb?->website ?? '',
            ]);

            $tasks[] = $this->createTask($session, 'create_dtg_listing', 'completed', $listingResult);
        } catch (\Throwable $e) {
            $errors[] = 'DTG listing creation failed: ' . $e->getMessage();
            $tasks[] = $this->createTask($session, 'create_dtg_listing', 'failed', ['error' => $e->getMessage()]);
        }

        // AlphaSite
        try {
            $alphaResult = $this->publishingService->activateAlphaSite([
                'business_name' => $businessName,
                'community_id' => $community->id,
                'external_id' => $customer->external_id ?? $customer->id,
                'email' => $customer->email ?? '',
                'tier' => $subscription?->tier ?? 'influencer',
            ]);

            $tasks[] = $this->createTask($session, 'activate_alphasite', 'completed', $alphaResult);
        } catch (\Throwable $e) {
            $errors[] = 'AlphaSite activation failed: ' . $e->getMessage();
            $tasks[] = $this->createTask($session, 'activate_alphasite', 'failed', ['error' => $e->getMessage()]);
        }

        // ── 4. Start onboarding timeline ─────────────────────────
        try {
            $onboardingTimeline = CampaignTimeline::where('slug', 'manifest-destiny-howto')
                ->where('is_active', true)
                ->first();

            if ($onboardingTimeline) {
                $this->orchestrator->startTimeline($customer, $onboardingTimeline);
                $tasks[] = $this->createTask($session, 'start_onboarding_timeline', 'completed', [
                    'timeline' => $onboardingTimeline->slug,
                ]);
            }
        } catch (\Throwable $e) {
            $errors[] = 'Timeline assignment failed: ' . $e->getMessage();
            $tasks[] = $this->createTask($session, 'start_onboarding_timeline', 'failed', ['error' => $e->getMessage()]);
        }

        // ── 5. Update customer status ────────────────────────────
        $customer->update([
            'subscription_tier' => $subscription?->tier ?? 'active',
            'campaign_status' => 'running',
        ]);

        Log::info('PitchProvisioning: completed', [
            'session_id' => $session->id,
            'customer_id' => $customer->id,
            'subscription_id' => $subscription?->id,
            'errors' => $errors,
            'tasks' => count($tasks),
        ]);

        return [
            'subscription' => $subscription,
            'tasks' => $tasks,
            'errors' => $errors,
        ];
    }

    private function createTask(PitchSession $session, string $type, string $status, array $data): ProvisioningTask
    {
        return ProvisioningTask::create([
            'customer_id' => $session->customer_id,
            'type' => $type,
            'status' => $status,
            'started_at' => now(),
            'completed_at' => $status === 'completed' ? now() : null,
            'failed_at' => $status === 'failed' ? now() : null,
            'result_data' => $data,
        ]);
    }

    private function resolveProductSlug(array $products): string
    {
        foreach ($products as $product) {
            $slug = is_array($product) ? ($product['slug'] ?? $product['product'] ?? '') : (string) $product;
            if (str_contains($slug, 'influencer')) {
                return 'community-influencer';
            }
            if (str_contains($slug, 'expert')) {
                return 'community-expert';
            }
            if (str_contains($slug, 'sponsor')) {
                return 'community-sponsor';
            }
        }

        return 'community-influencer';
    }

    private function resolveTier(string $productSlug): string
    {
        return match ($productSlug) {
            'community-influencer' => 'influencer',
            'community-expert' => 'expert',
            'community-sponsor' => 'sponsor',
            'community-reporter' => 'reporter',
            default => 'influencer',
        };
    }

    private function resolveRate(string $productSlug): float
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
