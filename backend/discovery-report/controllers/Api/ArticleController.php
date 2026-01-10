<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Article;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class ArticleController extends Controller
{
    /**
     * List articles
     */
    public function index(Request $request): JsonResponse
    {
        $query = Article::query();
        
        // Filters
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        
        if ($request->has('category')) {
            $query->where('category', $request->category);
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
        $articles = $query->orderBy('created_at', 'desc')->paginate($perPage);
        
        return response()->json([
            'data' => $articles->items(),
            'meta' => [
                'current_page' => $articles->currentPage(),
                'last_page' => $articles->lastPage(),
                'per_page' => $articles->perPage(),
                'total' => $articles->total(),
            ],
        ]);
    }
    
    /**
     * Create article
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string',
            'excerpt' => 'nullable|string',
            'content' => 'nullable|string',
            'category' => 'nullable|string',
            'status' => 'nullable|in:draft,pending,published,archived',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }
        
        $article = Article::create([
            'tenant_id' => $request->input('tenant_id', '00000000-0000-0000-0000-000000000000'),
            'title' => $request->title,
            'slug' => Str::slug($request->title),
            'excerpt' => $request->excerpt,
            'content' => $request->content,
            'category' => $request->category,
            'status' => $request->status ?? 'draft',
            'published_at' => $request->status === 'published' ? now() : null,
        ]);
        
        return response()->json([
            'data' => $article,
            'message' => 'Article created successfully'
        ], 201);
    }
    
    /**
     * Get article
     */
    public function show(string $id): JsonResponse
    {
        $article = Article::findOrFail($id);
        
        return response()->json([
            'data' => $article,
        ]);
    }
    
    /**
     * Update article
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $article = Article::findOrFail($id);
        
        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|string',
            'excerpt' => 'nullable|string',
            'content' => 'nullable|string',
            'category' => 'nullable|string',
            'status' => 'nullable|in:draft,pending,published,archived',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }
        
        $updateData = $request->only(['title', 'excerpt', 'content', 'category', 'status']);
        
        if ($request->has('title')) {
            $updateData['slug'] = Str::slug($request->title);
        }
        
        if ($request->has('status') && $request->status === 'published' && !$article->published_at) {
            $updateData['published_at'] = now();
        }
        
        $article->update($updateData);
        
        return response()->json([
            'data' => $article,
            'message' => 'Article updated successfully'
        ]);
    }
    
    /**
     * Delete article
     */
    public function destroy(string $id): JsonResponse
    {
        $article = Article::findOrFail($id);
        $article->delete();
        
        return response()->json([
            'message' => 'Article deleted successfully'
        ]);
    }
}
