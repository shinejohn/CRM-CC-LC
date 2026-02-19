<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\ServiceSubscription;
use App\Services\StripeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
class BillingController extends Controller
{
    public function __construct(
        private StripeService $stripeService
    ) {}

    /**
     * Get billing summary for the tenant
     */
    public function summary(Request $request): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');

        if (!$tenantId) {
            return response()->json(['error' => 'Tenant ID required'], 400);
        }

        $subscriptionsQuery = ServiceSubscription::where('tenant_id', $tenantId)
            ->where('status', 'active');

        if ($request->user()) {
            $subscriptionsQuery->where(function ($q) use ($request) {
                $q->where('user_id', $request->user()->id)
                    ->orWhereNull('user_id');
            });
        }

        $subscriptions = $subscriptionsQuery->with('service')->get();
        $monthlyCost = $subscriptions->sum(fn ($s) => (float) ($s->monthly_amount ?? $s->service?->price ?? 0));

        $ordersQuery = Order::where('tenant_id', $tenantId)
            ->where('payment_status', 'paid');

        if ($request->user()) {
            $ordersQuery->where('user_id', $request->user()->id);
        }

        $totalPaid = (float) $ordersQuery->sum('total');
        $outstandingQuery = Order::where('tenant_id', $tenantId)
            ->whereIn('payment_status', ['pending', 'failed']);

        if ($request->user()) {
            $outstandingQuery->where('user_id', $request->user()->id);
        }

        $outstanding = (float) $outstandingQuery->sum('total');

        $nextExpiry = $subscriptions
            ->map(fn ($s) => $s->subscription_expires_at)
            ->filter()
            ->min();
        $nextBillingDate = $nextExpiry?->toIso8601String() ?? now()->addMonth()->toIso8601String();

        $usagePercent = 0;
        if ($monthlyCost > 0 && $totalPaid > 0) {
            $usagePercent = min(100, round(($totalPaid / max($monthlyCost, 1)) * 100));
        }

        return response()->json([
            'data' => [
                'monthlyCost' => round($monthlyCost, 2),
                'usagePercent' => (int) $usagePercent,
                'outstanding' => round($outstanding, 2),
                'nextBillingDate' => $nextBillingDate,
            ],
        ]);
    }

    /**
     * List invoices (orders as payment records)
     */
    public function invoices(Request $request): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');

        if (!$tenantId) {
            return response()->json(['error' => 'Tenant ID required'], 400);
        }

        $query = Order::where('tenant_id', $tenantId)
            ->with(['items.service']);

        if ($request->user()) {
            $query->where('user_id', $request->user()->id);
        }

        $orders = $query->latest()->paginate(20);

        $data = $orders->getCollection()->map(function (Order $order) {
            $status = match ($order->payment_status) {
                'paid' => 'paid',
                'pending', 'failed' => 'pending',
                'refunded' => 'cancelled',
                default => 'pending',
            };

            $items = $order->items->map(fn ($item) => [
                'description' => $item->service_name,
                'quantity' => $item->quantity,
                'unitPrice' => (float) $item->price,
                'total' => (float) $item->total,
            ])->toArray();

            return [
                'id' => $order->id,
                'subscriptionId' => null,
                'serviceName' => $order->items->first()?->service_name ?? 'Order',
                'amount' => (float) $order->total,
                'status' => $status,
                'dueDate' => $order->created_at->toIso8601String(),
                'paidDate' => $order->paid_at?->toIso8601String(),
                'invoiceNumber' => $order->order_number,
                'items' => $items,
            ];
        });

        return response()->json([
            'data' => $data,
            'meta' => [
                'current_page' => $orders->currentPage(),
                'last_page' => $orders->lastPage(),
                'per_page' => $orders->perPage(),
                'total' => $orders->total(),
            ],
        ]);
    }

    /**
     * Create checkout session for pending invoice (order)
     */
    public function payInvoice(Request $request, string $id): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');

        if (!$tenantId) {
            return response()->json(['error' => 'Tenant ID required'], 400);
        }

        $order = Order::where('tenant_id', $tenantId)
            ->with('items')
            ->findOrFail($id);

        if ($order->payment_status === 'paid') {
            return response()->json(['error' => 'Invoice already paid'], 400);
        }

        $lineItems = $order->items->map(fn ($item) => [
            'price_data' => [
                'currency' => 'usd',
                'product_data' => [
                    'name' => $item->service_name,
                    'description' => $item->service_description,
                ],
                'unit_amount' => (int) ($item->price * 100),
            ],
            'quantity' => $item->quantity,
        ])->toArray();

        $successUrl = $request->input('success_url', url('/learning/services/orders/' . $order->id . '/success'));
        $cancelUrl = $request->input('cancel_url', url('/learning/services/billing'));

        $session = $this->stripeService->createCheckoutSession(
            $lineItems,
            $successUrl,
            $cancelUrl,
            ['order_id' => $order->id]
        );

        $order->update(['stripe_session_id' => $session->id]);

        return response()->json([
            'url' => $session->url,
            'session_id' => $session->id,
        ]);
    }
}
