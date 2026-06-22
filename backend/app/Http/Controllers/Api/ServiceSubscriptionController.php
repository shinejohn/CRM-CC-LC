<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Service;
use App\Models\ServiceSubscription;
use App\Services\ProrationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Throwable;

final class ServiceSubscriptionController extends Controller
{
    public function __construct(
        private ProrationService $prorationService,
    ) {}

    /**
     * The acting customer's current active subscription (+ plan info).
     */
    public function active(Request $request): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');

        if (! $tenantId) {
            return response()->json(['error' => 'Tenant ID required'], 400);
        }

        $query = ServiceSubscription::where('tenant_id', $tenantId)
            ->where('status', 'active')
            ->with('service');

        if ($request->user()) {
            $query->where(function ($q) use ($request) {
                $q->where('user_id', $request->user()->id)
                    ->orWhere('customer_id', $request->user()->customer_id ?? null);
            });
        }

        $sub = $query->orderBy('subscription_started_at', 'desc')->first();

        if (! $sub) {
            return response()->json(['data' => null]);
        }

        return response()->json(['data' => $this->presentSubscription($sub)]);
    }

    /**
     * Upgrade a subscription to a higher-priced plan.
     */
    public function upgrade(Request $request, string $id): JsonResponse
    {
        return $this->changePlan($request, $id, 'upgrade');
    }

    /**
     * Downgrade a subscription to a lower-priced plan.
     */
    public function downgrade(Request $request, string $id): JsonResponse
    {
        return $this->changePlan($request, $id, 'downgrade');
    }

    private function changePlan(Request $request, string $id, string $expectedDirection): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');

        if (! $tenantId) {
            return response()->json(['error' => 'Tenant ID required'], 400);
        }

        $validated = $request->validate([
            'target_service_id' => ['required', 'string'],
        ]);

        $sub = ServiceSubscription::where('tenant_id', $tenantId)
            ->where('id', $id)
            ->with('service')
            ->first();

        if (! $sub) {
            return response()->json(['error' => 'Subscription not found'], 404);
        }

        if ($sub->status !== 'active') {
            return response()->json(['error' => 'Only active subscriptions can change plans'], 422);
        }

        $targetService = Service::where('tenant_id', $tenantId)
            ->where('id', $validated['target_service_id'])
            ->first();

        if (! $targetService) {
            return response()->json(['error' => 'Target plan not found'], 404);
        }

        if (! $targetService->is_subscription) {
            return response()->json(['error' => 'Target plan is not a subscription plan'], 422);
        }

        if ($targetService->id === $sub->service_id) {
            return response()->json(['error' => 'Already on this plan'], 422);
        }

        $preview = $this->prorationService->preview($sub, $targetService);

        if ($preview['direction'] === 'unchanged') {
            return response()->json(['error' => 'New plan has the same price as the current plan'], 422);
        }

        if ($preview['direction'] !== $expectedDirection) {
            return response()->json([
                'error' => "This plan change is a {$preview['direction']}, not a {$expectedDirection}.",
            ], 422);
        }

        try {
            $updated = $this->prorationService->applyPlanChange($sub, $targetService);
        } catch (Throwable $e) {
            return response()->json(['error' => 'Failed to apply plan change: '.$e->getMessage()], 502);
        }

        return response()->json([
            'data' => $this->presentSubscription($updated),
            'proration' => $preview,
        ]);
    }

    private function presentSubscription(ServiceSubscription $sub): array
    {
        $service = $sub->service;

        return [
            'id' => $sub->id,
            'serviceId' => $sub->service_id,
            'serviceName' => $service?->name ?? 'Unknown Service',
            'status' => $sub->status,
            'tier' => $sub->tier ?? $service?->service_tier ?? 'standard',
            'price' => (float) ($sub->monthly_amount ?? $service?->price ?? 0),
            'billingCycle' => $sub->billing_cycle ?? $service?->billing_period ?? 'monthly',
            'stripeManaged' => ! empty($sub->stripe_subscription_id),
            'nextBillingDate' => $sub->subscription_expires_at?->toIso8601String()
                ?? now()->addMonth()->toIso8601String(),
            'createdAt' => $sub->created_at->toIso8601String(),
        ];
    }

    /**
     * List active service subscriptions for the tenant
     */
    public function index(Request $request): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');

        if (! $tenantId) {
            return response()->json(['error' => 'Tenant ID required'], 400);
        }

        $query = ServiceSubscription::where('tenant_id', $tenantId)
            ->whereIn('status', ['active'])
            ->with(['service', 'order']);

        if ($request->user()) {
            $query->where(function ($q) use ($request) {
                $q->where('user_id', $request->user()->id)
                    ->orWhere('customer_id', $request->user()->customer_id ?? null);
            });
        }

        $subscriptions = $query->orderBy('subscription_started_at', 'desc')->get();

        $data = $subscriptions->map(function (ServiceSubscription $sub) {
            $service = $sub->service;
            $nextBilling = $sub->subscription_expires_at;

            return [
                'id' => $sub->id,
                'serviceId' => $sub->service_id,
                'serviceName' => $service?->name ?? 'Unknown Service',
                'status' => $sub->status,
                'tier' => $sub->tier ?? $service?->service_tier ?? 'standard',
                'price' => (float) ($sub->monthly_amount ?? $service?->price ?? 0),
                'billingCycle' => $sub->billing_cycle ?? $service?->billing_period ?? 'monthly',
                'usage' => [
                    'current' => 0,
                    'limit' => 100,
                    'unit' => 'usage',
                ],
                'nextBillingDate' => $nextBilling?->toIso8601String() ?? now()->addMonth()->toIso8601String(),
                'createdAt' => $sub->created_at->toIso8601String(),
            ];
        });

        return response()->json(['data' => $data]);
    }

    /**
     * Cancel a service subscription
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');

        if (! $tenantId) {
            return response()->json(['error' => 'Tenant ID required'], 400);
        }

        $sub = ServiceSubscription::where('tenant_id', $tenantId)
            ->where('id', $id)
            ->firstOrFail();

        $sub->update([
            'status' => 'cancelled',
            'cancelled_at' => now(),
        ]);

        return response()->json(['message' => 'Subscription cancelled']);
    }
}
