<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CommunitySubscription;
use App\Models\Customer;
use App\Services\CommunitySubscriptionService;
use App\Services\Pitch\SlotInventoryService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

final class CommunitySubscriptionController extends Controller
{
    private CommunitySubscriptionService $subscriptionService;

    private SlotInventoryService $slotService;

    public function __construct(
        CommunitySubscriptionService $subscriptionService,
        SlotInventoryService $slotService
    ) {
        $this->subscriptionService = $subscriptionService;
        $this->slotService = $slotService;
    }

    /**
     * List community subscriptions for the authenticated user.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $tenantId = (string) ($user->tenant_id ?? $user->id);

        $customerIds = Customer::query()
            ->withoutGlobalScopes()
            ->where('tenant_id', $tenantId)
            ->pluck('id');

        if ($customerIds->isEmpty()) {
            return response()->json(['data' => []]);
        }

        $subscriptions = CommunitySubscription::whereIn('customer_id', $customerIds)
            ->with('community')
            ->orderByDesc('created_at')
            ->get();

        return response()->json(['data' => $subscriptions]);
    }

    /**
     * Create a new community subscription.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_id' => 'nullable|uuid|exists:customers,id',
            'community_id' => 'required|exists:communities,id',
            'product_slug' => 'required|string|in:community-influencer,community-expert,community-sponsor,community-reporter',
            'payment_method_id' => 'required|string',
            'category_group' => 'nullable|string',
            'category_subtype' => 'nullable|string',
        ]);

        $user = $request->user();
        $tenantId = (string) ($user->tenant_id ?? $user->id);

        if (! empty($validated['customer_id'])) {
            $customer = Customer::query()
                ->withoutGlobalScopes()
                ->where('id', $validated['customer_id'])
                ->where('tenant_id', $tenantId)
                ->first();
            if (! $customer) {
                return response()->json(['error' => 'Customer not found for this account'], 404);
            }
        } else {
            $customer = Customer::query()
                ->withoutGlobalScopes()
                ->where('tenant_id', $tenantId)
                ->orderBy('created_at')
                ->first();
            if (! $customer) {
                return response()->json([
                    'error' => 'No customer record found for this account. Add one in CRM before subscribing.',
                ], 422);
            }
        }

        try {
            $subscription = $this->subscriptionService->subscribe(
                $customer,
                $validated['community_id'],
                $validated['product_slug'],
                $validated['payment_method_id'],
                $validated['category_group'] ?? null,
                $validated['category_subtype'] ?? null
            );

            return response()->json([
                'message' => 'Community subscription created successfully',
                'data' => $subscription->load('community'),
            ], 201);
        } catch (\Exception $e) {
            Log::error('Community subscription creation failed: '.$e->getMessage(), ['exception' => $e]);

            return response()->json(['error' => $e->getMessage()], 422);
        }
    }

    /**
     * Check founder pricing eligibility for a community.
     */
    public function founderCheck(string $communityId)
    {
        $result = $this->subscriptionService->checkFounderEligibility($communityId);

        return response()->json(['data' => $result]);
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
     * Get a specific subscription.
     */
    public function show(Request $request, string $id)
    {
        $subscription = CommunitySubscription::with('community', 'customer')->findOrFail($id);
        $this->assertSubscriptionAccessibleToUser($request->user(), $subscription);

        return response()->json(['data' => $subscription]);
    }

    /**
     * Cancel a subscription.
     */
    public function destroy(Request $request, string $id)
    {
        $subscription = CommunitySubscription::findOrFail($id);
        $this->assertSubscriptionAccessibleToUser($request->user(), $subscription);

        $reason = $request->input('reason', 'Customer requested cancellation');

        try {
            $updated = $this->subscriptionService->cancel($subscription, $reason);

            return response()->json([
                'message' => 'Subscription cancelled successfully',
                'data' => $updated,
            ]);
        } catch (\Exception $e) {
            Log::error('Community subscription cancellation failed: '.$e->getMessage(), ['exception' => $e]);

            return response()->json(['error' => 'Failed to cancel subscription'], 500);
        }
    }

    private function assertSubscriptionAccessibleToUser($user, CommunitySubscription $subscription): void
    {
        $tenantId = (string) ($user->tenant_id ?? $user->id);
        $ok = Customer::query()
            ->withoutGlobalScopes()
            ->where('id', $subscription->customer_id)
            ->where('tenant_id', $tenantId)
            ->exists();

        if (! $ok) {
            abort(404);
        }
    }
}
