<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class CustomerController extends Controller
{
    /**
     * List all customers for the tenant
     */
    public function index(Request $request): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        if (!$tenantId) {
            return response()->json(['error' => 'Tenant ID required'], 400);
        }
        
        $query = Customer::where('tenant_id', $tenantId);
        
        // Apply filters
        if ($request->has('industry_category')) {
            $query->where('industry_category', $request->input('industry_category'));
        }
        
        if ($request->has('lead_score_min')) {
            $query->where('lead_score', '>=', $request->input('lead_score_min'));
        }
        
        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function($q) use ($search) {
                $q->where('business_name', 'ilike', "%{$search}%")
                  ->orWhere('email', 'ilike', "%{$search}%")
                  ->orWhere('owner_name', 'ilike', "%{$search}%");
            });
        }
        
        // Pagination
        $perPage = $request->input('per_page', 20);
        $customers = $query->orderBy('created_at', 'desc')->paginate($perPage);
        
        return response()->json([
            'data' => $customers->items(),
            'meta' => [
                'current_page' => $customers->currentPage(),
                'last_page' => $customers->lastPage(),
                'per_page' => $customers->perPage(),
                'total' => $customers->total(),
            ],
        ]);
    }
    
    /**
     * Get a specific customer
     */
    public function show(Request $request, string $id): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        $customer = Customer::where('tenant_id', $tenantId)
            ->with(['conversations', 'pendingQuestions', 'faqs'])
            ->findOrFail($id);
        
        return response()->json(['data' => $customer]);
    }
    
    /**
     * Get customer by slug
     */
    public function showBySlug(Request $request, string $slug): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        $customer = Customer::where('tenant_id', $tenantId)
            ->where('slug', $slug)
            ->with(['conversations', 'pendingQuestions', 'faqs'])
            ->firstOrFail();
        
        return response()->json(['data' => $customer]);
    }
    
    /**
     * Create a new customer
     */
    public function store(Request $request): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        if (!$tenantId) {
            return response()->json(['error' => 'Tenant ID required'], 400);
        }
        
        $validated = $request->validate([
            'business_name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:100|unique:customers,slug',
            'external_id' => 'nullable|string|max:100',
            'owner_name' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'website' => 'nullable|url|max:255',
            'industry_id' => 'nullable|string|max:50',
            'industry_category' => 'nullable|string',
            'industry_subcategory' => 'nullable|string',
            'sub_category' => 'nullable|string|max:100',
            'business_description' => 'nullable|string',
            'lead_source' => 'nullable|string|max:100',
            'subscription_tier' => 'nullable|string|max:50',
            // Allow all other fields as optional
        ]);
        
        $validated['tenant_id'] = $tenantId;
        
        // Generate slug if not provided
        if (empty($validated['slug'])) {
            $baseSlug = Str::slug($validated['business_name']);
            $slug = $baseSlug;
            $counter = 1;
            while (Customer::where('slug', $slug)->exists()) {
                $slug = $baseSlug . '-' . $counter;
                $counter++;
            }
            $validated['slug'] = $slug;
        }
        
        $customer = Customer::create($validated);
        
        return response()->json([
            'data' => $customer,
            'message' => 'Customer created successfully'
        ], 201);
    }
    
    /**
     * Update a customer
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        $customer = Customer::where('tenant_id', $tenantId)->findOrFail($id);
        
        $validated = $request->validate([
            'business_name' => 'sometimes|string|max:255',
            'slug' => ['sometimes', 'string', 'max:100', Rule::unique('customers')->ignore($customer->id)],
            'external_id' => 'nullable|string|max:100',
            'owner_name' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'website' => 'nullable|url|max:255',
            'industry_id' => 'nullable|string|max:50',
            'industry_category' => 'nullable|string',
            'industry_subcategory' => 'nullable|string',
            'sub_category' => 'nullable|string|max:100',
            'business_description' => 'nullable|string',
            'lead_score' => 'nullable|integer|min:0|max:100',
            'lead_source' => 'nullable|string|max:100',
            'subscription_tier' => 'nullable|string|max:50',
            // Allow all other fields
        ]);
        
        $customer->update($validated);
        
        return response()->json([
            'data' => $customer->fresh(),
            'message' => 'Customer updated successfully'
        ]);
    }
    
    /**
     * Delete a customer
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        $customer = Customer::where('tenant_id', $tenantId)->findOrFail($id);
        $customer->delete();
        
        return response()->json([
            'message' => 'Customer deleted successfully'
        ]);
    }
    
    /**
     * Update customer business context (AI-first CRM)
     */
    public function updateBusinessContext(Request $request, string $id): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        $customer = Customer::where('tenant_id', $tenantId)->findOrFail($id);
        
        $validated = $request->validate([
            'industry_category' => 'nullable|string',
            'industry_subcategory' => 'nullable|string',
            'business_description' => 'nullable|string',
            'unique_selling_points' => 'nullable|array',
            'products_services' => 'nullable|array',
            'target_audience' => 'nullable|array',
            'business_hours' => 'nullable|array',
            'service_area' => 'nullable|string',
            'brand_voice' => 'nullable|array',
            'content_preferences' => 'nullable|array',
            'contact_preferences' => 'nullable|array',
        ]);
        
        $customer->update($validated);
        
        return response()->json([
            'data' => $customer->fresh(),
            'message' => 'Business context updated successfully'
        ]);
    }
    
    /**
     * Get customer context for AI (helper endpoint)
     */
    public function getAiContext(Request $request, string $id): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        $customer = Customer::where('tenant_id', $tenantId)->findOrFail($id);
        
        // Return structured context for AI
        $context = [
            'customer_id' => $customer->id,
            'business_name' => $customer->business_name,
            'owner_name' => $customer->owner_name,
            'industry' => [
                'category' => $customer->industry_category,
                'subcategory' => $customer->industry_subcategory,
                'id' => $customer->industry_id,
            ],
            'business_description' => $customer->business_description,
            'unique_selling_points' => $customer->unique_selling_points,
            'products_services' => $customer->products_services,
            'target_audience' => $customer->target_audience,
            'brand_voice' => $customer->brand_voice,
            'content_preferences' => $customer->content_preferences,
            'contact_preferences' => $customer->contact_preferences,
            'location' => [
                'city' => $customer->city,
                'state' => $customer->state,
                'service_area' => $customer->service_area,
            ],
            'contact' => [
                'email' => $customer->email,
                'phone' => $customer->phone,
                'website' => $customer->website,
            ],
            'relationship' => [
                'lead_score' => $customer->lead_score,
                'subscription_tier' => $customer->subscription_tier,
                'onboarded_at' => $customer->onboarded_at,
            ],
        ];
        
        return response()->json(['data' => $context]);
    }
}
