<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Service;
use App\Services\StripeService;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class OrderController extends Controller
{
    public function __construct(
        private StripeService $stripeService
    ) {}

    /**
     * List orders for the tenant/user
     */
    public function index(Request $request): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        if (!$tenantId) {
            return response()->json(['error' => 'Tenant ID required'], 400);
        }
        
        $query = Order::where('tenant_id', $tenantId)
            ->with(['items.service', 'customer']);
        
        // Filter by user if authenticated
        if ($request->user()) {
            $query->where('user_id', $request->user()->id);
        }
        
        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->input('status'));
        }
        
        // Filter by payment_status
        if ($request->has('payment_status')) {
            $query->where('payment_status', $request->input('payment_status'));
        }
        
        $perPage = $request->input('per_page', 20);
        $orders = $query->latest()->paginate($perPage);
        
        return response()->json([
            'data' => $orders->items(),
            'meta' => [
                'current_page' => $orders->currentPage(),
                'last_page' => $orders->lastPage(),
                'per_page' => $orders->perPage(),
                'total' => $orders->total(),
            ],
        ]);
    }
    
    /**
     * Get order details
     */
    public function show(Request $request, string $id): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        $order = Order::where('tenant_id', $tenantId)
            ->with(['items.service', 'customer', 'user'])
            ->findOrFail($id);
        
        // Check authorization - user can only see their own orders
        if ($request->user() && $order->user_id !== $request->user()->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }
        
        return response()->json([
            'data' => [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'customer_email' => $order->customer_email,
                'customer_name' => $order->customer_name,
                'subtotal' => $order->subtotal,
                'tax' => $order->tax,
                'shipping' => $order->shipping,
                'total' => $order->total,
                'status' => $order->status,
                'payment_status' => $order->payment_status,
                'shipping_address' => $order->shipping_address,
                'billing_address' => $order->billing_address,
                'notes' => $order->notes,
                'paid_at' => $order->paid_at?->toIso8601String(),
                'created_at' => $order->created_at->toIso8601String(),
                'items' => $order->items->map(fn($item) => [
                    'id' => $item->id,
                    'service_name' => $item->service_name,
                    'service_description' => $item->service_description,
                    'price' => $item->price,
                    'quantity' => $item->quantity,
                    'total' => $item->total,
                    'service' => $item->service ? [
                        'id' => $item->service->id,
                        'name' => $item->service->name,
                        'slug' => $item->service->slug,
                        'images' => $item->service->images,
                    ] : null,
                ]),
            ],
        ]);
    }
    
    /**
     * Create checkout session from service IDs
     */
    public function checkout(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'services' => 'required|array|min:1',
            'services.*.service_id' => 'required|uuid|exists:services,id',
            'services.*.quantity' => 'required|integer|min:1',
            'customer_email' => 'required|email',
            'customer_name' => 'nullable|string|max:255',
            'customer_id' => 'nullable|uuid|exists:customers,id',
        ]);
        
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        if (!$tenantId) {
            return response()->json(['error' => 'Tenant ID required'], 400);
        }
        
        try {
            DB::beginTransaction();
            
            // Prepare line items and validate stock
            $lineItems = [];
            $subtotal = 0;
            $services = [];
            
            foreach ($request->input('services') as $item) {
                $service = Service::where('tenant_id', $tenantId)
                    ->where('id', $item['service_id'])
                    ->where('is_active', true)
                    ->firstOrFail();
                
                if (!$service->isInStock()) {
                    return response()->json([
                        'error' => "Service {$service->name} is out of stock",
                    ], 400);
                }
                
                $quantity = $item['quantity'];
                if ($service->track_inventory && $service->quantity < $quantity) {
                    return response()->json([
                        'error' => "Not enough stock for {$service->name}",
                    ], 400);
                }
                
                $serviceData = [
                    'name' => $service->name,
                ];
                
                if (!empty($service->description)) {
                    $serviceData['description'] = $service->description;
                }
                
                if ($service->images && count($service->images) > 0) {
                    $serviceData['images'] = array_map(function($image) {
                        return asset('storage/' . $image);
                    }, $service->images);
                }
                
                $lineItems[] = [
                    'price_data' => [
                        'currency' => 'usd',
                        'product_data' => $serviceData,
                        'unit_amount' => (int) ($service->price * 100),
                    ],
                    'quantity' => $quantity,
                ];
                
                $subtotal += $service->price * $quantity;
                $services[] = ['service' => $service, 'quantity' => $quantity];
            }
            
            // Create order
            $order = Order::create([
                'tenant_id' => $tenantId,
                'user_id' => $request->user()?->id,
                'customer_id' => $request->input('customer_id'),
                'customer_email' => $request->input('customer_email'),
                'customer_name' => $request->input('customer_name'),
                'subtotal' => $subtotal,
                'tax' => 0,
                'shipping' => 0,
                'total' => $subtotal,
                'status' => 'pending',
                'payment_status' => 'pending',
            ]);
            
            // Create order items
            foreach ($services as $item) {
                $service = $item['service'];
                $quantity = $item['quantity'];
                
                OrderItem::create([
                    'order_id' => $order->id,
                    'service_id' => $service->id,
                    'service_name' => $service->name,
                    'service_description' => $service->description,
                    'price' => $service->price,
                    'quantity' => $quantity,
                    'total' => $service->price * $quantity,
                ]);
            }
            
            // Create Stripe checkout session
            $successUrl = $request->input('success_url', url('/learning/services/orders/' . $order->id . '/success'));
            $cancelUrl = $request->input('cancel_url', url('/learning/services/checkout?cancelled=true'));
            
            $session = $this->stripeService->createCheckoutSession(
                $lineItems,
                $successUrl,
                $cancelUrl,
                ['order_id' => $order->id]
            );
            
            $order->update([
                'stripe_session_id' => $session->id,
                'stripe_payment_intent_id' => $session->payment_intent,
            ]);
            
            // Mark order as processing (will be updated to paid when webhook received)
            $order->update(['status' => 'processing']);
            
            DB::commit();
            
            return response()->json([
                'session_id' => $session->id,
                'url' => $session->url,
                'order_id' => $order->id,
            ]);
        } catch (Exception $e) {
            DB::rollBack();
            Log::error('Checkout failed: ' . $e->getMessage());
            
            return response()->json([
                'error' => 'Failed to create checkout session: ' . $e->getMessage(),
            ], 500);
        }
    }
}
