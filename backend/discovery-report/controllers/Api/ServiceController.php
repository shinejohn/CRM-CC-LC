<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Service;
use App\Models\ServiceCategory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ServiceController extends Controller
{
    /**
     * List all services
     */
    public function index(Request $request): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        if (!$tenantId) {
            return response()->json(['error' => 'Tenant ID required'], 400);
        }
        
        $query = Service::where('tenant_id', $tenantId)->where('is_active', true);
        
        // Filter by category
        if ($request->has('category_id')) {
            $query->where('service_category_id', $request->input('category_id'));
        }
        
        // Filter by service type
        if ($request->has('service_type')) {
            $query->where('service_type', $request->input('service_type'));
        }
        
        // Filter by tier
        if ($request->has('service_tier')) {
            $query->where('service_tier', $request->input('service_tier'));
        }
        
        // Filter by subscription type
        if ($request->has('is_subscription')) {
            $query->where('is_subscription', filter_var($request->input('is_subscription'), FILTER_VALIDATE_BOOLEAN));
        }
        
        // Search
        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function($q) use ($search) {
                $q->where('name', 'ILIKE', "%{$search}%")
                  ->orWhere('description', 'ILIKE', "%{$search}%");
            });
        }
        
        // Featured first
        $query->orderBy('is_featured', 'desc');
        $query->orderBy('name', 'asc');
        
        $perPage = $request->input('per_page', 20);
        $services = $query->with('category')->paginate($perPage);
        
        return response()->json([
            'data' => $services->items(),
            'meta' => [
                'current_page' => $services->currentPage(),
                'last_page' => $services->lastPage(),
                'per_page' => $services->perPage(),
                'total' => $services->total(),
            ],
        ]);
    }
    
    /**
     * Get service details
     */
    public function show(Request $request, string $id): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        $service = Service::where('tenant_id', $tenantId)
            ->with('category')
            ->findOrFail($id);
        
        return response()->json([
            'data' => [
                'id' => $service->id,
                'name' => $service->name,
                'slug' => $service->slug,
                'description' => $service->description,
                'long_description' => $service->long_description,
                'images' => $service->images,
                'price' => $service->price,
                'compare_at_price' => $service->compare_at_price,
                'discount_percentage' => $service->discount_percentage,
                'service_type' => $service->service_type,
                'service_tier' => $service->service_tier,
                'is_subscription' => $service->is_subscription,
                'billing_period' => $service->billing_period,
                'features' => $service->features,
                'capabilities' => $service->capabilities,
                'integrations' => $service->integrations,
                'is_in_stock' => $service->isInStock(),
                'sku' => $service->sku,
                'is_featured' => $service->is_featured,
                'category' => $service->category ? [
                    'id' => $service->category->id,
                    'name' => $service->category->name,
                    'slug' => $service->category->slug,
                ] : null,
            ],
        ]);
    }
    
    /**
     * Get services by type
     */
    public function byType(Request $request, string $type): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        $services = Service::where('tenant_id', $tenantId)
            ->where('service_type', $type)
            ->where('is_active', true)
            ->with('category')
            ->orderBy('is_featured', 'desc')
            ->orderBy('price', 'asc')
            ->get();
        
        return response()->json([
            'data' => $services->map(fn($service) => [
                'id' => $service->id,
                'name' => $service->name,
                'slug' => $service->slug,
                'description' => $service->description,
                'price' => $service->price,
                'service_tier' => $service->service_tier,
                'is_subscription' => $service->is_subscription,
                'billing_period' => $service->billing_period,
            ]),
        ]);
    }
}
