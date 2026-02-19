<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ServiceSubscription;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ServiceSubscriptionController extends Controller
{
    /**
     * List active service subscriptions for the tenant
     */
    public function index(Request $request): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');

        if (!$tenantId) {
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

        if (!$tenantId) {
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
