<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Knowledge;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class TrainingController extends Controller
{
    /**
     * Get training content by category
     */
    public function index(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'tenant_id' => 'required|uuid',
            'category' => 'nullable|string',
            'limit' => 'nullable|integer|min:1|max:100',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }
        
        $tenantId = $request->input('tenant_id');
        $category = $request->input('category');
        $limit = $request->input('limit', 20);
        
        $query = Knowledge::where('tenant_id', $tenantId)
            ->where('is_public', true)
            ->where('category', 'training');
        
        if ($category) {
            $query->where('subcategory', $category);
        }
        
        $content = $query->orderBy('usage_count', 'desc')
            ->orderBy('helpful_count', 'desc')
            ->limit($limit)
            ->get();
        
        return response()->json([
            'data' => $content,
            'count' => $content->count(),
        ]);
    }
    
    /**
     * Get training content by ID
     */
    public function show(string $id): JsonResponse
    {
        $content = Knowledge::where('is_public', true)
            ->where('category', 'training')
            ->findOrFail($id);
        
        // Increment usage count
        $content->increment('usage_count');
        
        return response()->json([
            'data' => $content,
        ]);
    }
    
    /**
     * Mark training content as helpful
     */
    public function markHelpful(string $id): JsonResponse
    {
        $content = Knowledge::where('category', 'training')->findOrFail($id);
        $content->increment('helpful_count');
        
        return response()->json([
            'data' => $content->fresh(),
            'message' => 'Marked as helpful',
        ]);
    }
    
    /**
     * Mark training content as not helpful
     */
    public function markNotHelpful(string $id): JsonResponse
    {
        $content = Knowledge::where('category', 'training')->findOrFail($id);
        $content->increment('not_helpful_count');
        
        return response()->json([
            'data' => $content->fresh(),
            'message' => 'Marked as not helpful',
        ]);
    }
}
