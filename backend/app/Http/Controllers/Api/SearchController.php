<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Knowledge;
use App\Services\OpenAIService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class SearchController extends Controller
{
    protected OpenAIService $openaiService;

    public function __construct(OpenAIService $openaiService)
    {
        $this->openaiService = $openaiService;
    }

    /**
     * Semantic/vector search
     */
    public function search(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'query' => 'required|string',
            'tenant_id' => 'required|uuid',
            'limit' => 'nullable|integer|min:1|max:50',
            'threshold' => 'nullable|numeric|min:0|max:1',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }
        
        $queryText = $request->input('query');
        $tenantId = $request->input('tenant_id');
        $limit = $request->input('limit', 10);
        $threshold = $request->input('threshold', 0.7);
        
        // Generate embedding for query
        $queryEmbedding = $this->openaiService->generateEmbedding($queryText);
        
        if (!$queryEmbedding) {
            return response()->json([
                'error' => 'Failed to generate embedding for query'
            ], 500);
        }
        
        // Convert array to PostgreSQL vector format
        $embeddingString = '[' . implode(',', $queryEmbedding) . ']';
        
        // Use the database function for vector search
        $results = DB::select(
            "SELECT * FROM search_knowledge_base(?, ?, ?::vector, ?, ?)",
            [$tenantId, $queryText, $embeddingString, $limit, $threshold]
        );
        
        return response()->json([
            'data' => $results,
            'query' => $queryText,
            'count' => count($results),
        ]);
    }
    
    /**
     * Get embedding status for all knowledge items
     */
    public function embeddingStatus(): JsonResponse
    {
        $status = Knowledge::select('embedding_status', DB::raw('COUNT(*) as count'))
            ->groupBy('embedding_status')
            ->get()
            ->keyBy('embedding_status');
        
        $total = Knowledge::count();
        $pending = Knowledge::where('embedding_status', 'pending')->count();
        $completed = Knowledge::where('embedding_status', 'completed')->count();
        $processing = Knowledge::where('embedding_status', 'processing')->count();
        $failed = Knowledge::where('embedding_status', 'failed')->count();
        
        return response()->json([
            'data' => [
                'total' => $total,
                'pending' => $pending,
                'processing' => $processing,
                'completed' => $completed,
                'failed' => $failed,
                'percentage_complete' => $total > 0 ? round(($completed / $total) * 100, 2) : 0,
            ],
        ]);
    }
}
