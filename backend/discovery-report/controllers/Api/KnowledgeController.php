<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Knowledge;
use App\Models\FaqCategory;
use App\Jobs\GenerateEmbedding;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class KnowledgeController extends Controller
{
    /**
     * List knowledge items
     */
    public function index(Request $request): JsonResponse
    {
        $query = Knowledge::query();
        
        // Filters
        if ($request->has('category')) {
            $query->where('category', $request->category);
        }
        
        if ($request->has('embedding_status')) {
            $query->where('embedding_status', $request->embedding_status);
        }
        
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('title', 'ILIKE', "%{$search}%")
                  ->orWhere('content', 'ILIKE', "%{$search}%");
            });
        }
        
        // Pagination
        $perPage = $request->get('per_page', 20);
        $knowledge = $query->orderBy('created_at', 'desc')->paginate($perPage);
        
        return response()->json([
            'data' => $knowledge->items(),
            'meta' => [
                'current_page' => $knowledge->currentPage(),
                'last_page' => $knowledge->lastPage(),
                'per_page' => $knowledge->perPage(),
                'total' => $knowledge->total(),
            ],
        ]);
    }
    
    /**
     * Create knowledge item
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string',
            'content' => 'required|string',
            'category' => 'nullable|string',
            'subcategory' => 'nullable|string',
            'industry_codes' => 'nullable|array',
            'source' => 'nullable|in:google,serpapi,website,owner',
            'source_url' => 'nullable|url',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }
        
        $knowledge = Knowledge::create([
            'tenant_id' => $request->input('tenant_id', '00000000-0000-0000-0000-000000000000'), // TODO: Get from auth
            'title' => $request->title,
            'content' => $request->content,
            'category' => $request->category,
            'subcategory' => $request->subcategory,
            'industry_codes' => $request->industry_codes,
            'source' => $request->source,
            'source_url' => $request->source_url,
            'embedding_status' => 'pending',
        ]);
        
        // Queue embedding generation
        GenerateEmbedding::dispatch($knowledge->id);
        
        return response()->json([
            'data' => $knowledge,
            'message' => 'Knowledge item created successfully'
        ], 201);
    }
    
    /**
     * Get knowledge item
     */
    public function show(string $id): JsonResponse
    {
        $knowledge = Knowledge::findOrFail($id);
        
        return response()->json([
            'data' => $knowledge,
        ]);
    }
    
    /**
     * Update knowledge item
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $knowledge = Knowledge::findOrFail($id);
        
        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|string',
            'content' => 'sometimes|string',
            'category' => 'nullable|string',
            'subcategory' => 'nullable|string',
            'industry_codes' => 'nullable|array',
            'source' => 'nullable|in:google,serpapi,website,owner',
            'source_url' => 'nullable|url',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }
        
        $knowledge->update($request->only([
            'title', 'content', 'category', 'subcategory',
            'industry_codes', 'source', 'source_url'
        ]));
        
        // If content changed, reset embedding status
        if ($request->has('content')) {
            $knowledge->update([
                'embedding_status' => 'pending'
            ]);
            GenerateEmbedding::dispatch($knowledge->id);
        }
        
        return response()->json([
            'data' => $knowledge,
            'message' => 'Knowledge item updated successfully'
        ]);
    }
    
    /**
     * Delete knowledge item
     */
    public function destroy(string $id): JsonResponse
    {
        $knowledge = Knowledge::findOrFail($id);
        $knowledge->delete();
        
        return response()->json([
            'message' => 'Knowledge item deleted successfully'
        ]);
    }
    
    /**
     * Generate embedding for knowledge item
     */
    public function generateEmbedding(string $id): JsonResponse
    {
        $knowledge = Knowledge::findOrFail($id);
        
        $knowledge->update(['embedding_status' => 'processing']);
        GenerateEmbedding::dispatch($knowledge->id);
        
        return response()->json([
            'message' => 'Embedding generation started'
        ]);
    }
    
    /**
     * Vote on knowledge item (helpful/not helpful)
     */
    public function vote(Request $request, string $id): JsonResponse
    {
        $knowledge = Knowledge::findOrFail($id);
        
        $validator = Validator::make($request->all(), [
            'vote' => 'required|in:helpful,not_helpful'
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }
        
        if ($request->vote === 'helpful') {
            $knowledge->increment('helpful_count');
        } else {
            $knowledge->increment('not_helpful_count');
        }
        
        return response()->json([
            'data' => $knowledge->fresh(),
            'message' => 'Vote recorded successfully'
        ]);
    }
    
    /**
     * List FAQ categories
     */
    public function categories(): JsonResponse
    {
        $categories = FaqCategory::with('children')
            ->whereNull('parent_id')
            ->orderBy('display_order')
            ->get();
        
        return response()->json([
            'data' => $categories,
        ]);
    }
    
    /**
     * Create FAQ category
     */
    public function storeCategory(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:faq_categories,slug',
            'description' => 'nullable|string',
            'parent_id' => 'nullable|uuid|exists:faq_categories,id',
            'icon' => 'nullable|string|max:50',
            'color' => 'nullable|string|max:7',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }
        
        $category = FaqCategory::create($request->all());
        
        return response()->json([
            'data' => $category,
            'message' => 'Category created successfully'
        ], 201);
    }
    
    /**
     * Get FAQ category
     */
    public function showCategory(string $id): JsonResponse
    {
        $category = FaqCategory::with('children', 'parent')->findOrFail($id);
        
        return response()->json([
            'data' => $category,
        ]);
    }
    
    /**
     * Update FAQ category
     */
    public function updateCategory(Request $request, string $id): JsonResponse
    {
        $category = FaqCategory::findOrFail($id);
        
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'slug' => 'sometimes|string|max:255|unique:faq_categories,slug,' . $id,
            'description' => 'nullable|string',
            'parent_id' => 'nullable|uuid|exists:faq_categories,id',
            'icon' => 'nullable|string|max:50',
            'color' => 'nullable|string|max:7',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }
        
        $category->update($request->all());
        
        return response()->json([
            'data' => $category,
            'message' => 'Category updated successfully'
        ]);
    }
    
    /**
     * Delete FAQ category
     */
    public function destroyCategory(string $id): JsonResponse
    {
        $category = FaqCategory::findOrFail($id);
        $category->delete();
        
        return response()->json([
            'message' => 'Category deleted successfully'
        ]);
    }
}
