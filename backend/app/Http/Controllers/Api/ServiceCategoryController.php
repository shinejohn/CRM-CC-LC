<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ServiceCategory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ServiceCategoryController extends Controller
{
    /**
     * List all service categories
     */
    public function index(Request $request): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        $categories = ServiceCategory::where('tenant_id', $tenantId)
            ->where('is_active', true)
            ->orderBy('display_order', 'asc')
            ->orderBy('name', 'asc')
            ->get();
        
        return response()->json([
            'data' => $categories->map(fn($category) => [
                'id' => $category->id,
                'name' => $category->name,
                'slug' => $category->slug,
                'description' => $category->description,
                'display_order' => $category->display_order,
            ]),
        ]);
    }
    
    /**
     * Get category details with services
     */
    public function show(Request $request, string $id): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        $category = ServiceCategory::where('tenant_id', $tenantId)
            ->with(['services' => function($query) {
                $query->where('is_active', true)
                    ->orderBy('is_featured', 'desc')
                    ->orderBy('price', 'asc');
            }])
            ->findOrFail($id);
        
        return response()->json([
            'data' => [
                'id' => $category->id,
                'name' => $category->name,
                'slug' => $category->slug,
                'description' => $category->description,
                'services' => $category->services->map(fn($service) => [
                    'id' => $service->id,
                    'name' => $service->name,
                    'slug' => $service->slug,
                    'description' => $service->description,
                    'price' => $service->price,
                    'service_type' => $service->service_type,
                    'service_tier' => $service->service_tier,
                ]),
            ],
        ]);
    }
}
