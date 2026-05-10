<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Service;
use App\Models\ServiceCategory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

final class ServiceCategoryController extends Controller
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

    /**
     * List services in a category
     */
    public function services(Request $request, string $id): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');

        $category = ServiceCategory::where('tenant_id', $tenantId)->findOrFail($id);

        $services = Service::where('service_category_id', $category->id)
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        return response()->json([
            'data' => $services->map(fn($service) => [
                'id' => $service->id,
                'name' => $service->name,
                'price' => $service->price,
                'slug' => $service->slug,
                'description' => $service->description,
            ]),
        ]);
    }

    /**
     * Create a new service category
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255',
            'description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');

        $category = ServiceCategory::create([
            'tenant_id' => $tenantId,
            'name' => $request->input('name'),
            'slug' => $request->input('slug', \Illuminate\Support\Str::slug($request->input('name'))),
            'description' => $request->input('description'),
        ]);

        return response()->json([
            'data' => [
                'id' => $category->id,
                'name' => $category->name,
                'slug' => $category->slug,
                'description' => $category->description,
            ],
        ], 201);
    }

    /**
     * Update a service category
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');

        $category = ServiceCategory::where('tenant_id', $tenantId)->findOrFail($id);

        $category->update($request->only(['name', 'slug', 'description']));

        return response()->json([
            'data' => [
                'id' => $category->id,
                'name' => $category->name,
                'slug' => $category->slug,
                'description' => $category->description,
            ],
        ]);
    }

    /**
     * Delete a service category
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');

        $category = ServiceCategory::where('tenant_id', $tenantId)->findOrFail($id);
        $category->delete();

        return response()->json(null, 204);
    }
}
