<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Knowledge;
use App\Services\OpenAIService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

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
        try {
            $results = DB::select(
                "SELECT * FROM search_knowledge_base(?, ?, ?::vector, ?, ?)",
                [$tenantId, $queryText, $embeddingString, $limit, $threshold]
            );
        } catch (\Exception $e) {
            // If database function doesn't exist or vector extension not available, use direct query
            Log::warning('Vector search function not available, using direct query', ['error' => $e->getMessage()]);
            
            $results = DB::select("
                SELECT 
                    id,
                    title,
                    content,
                    category,
                    source,
                    validation_status,
                    1 - (embedding <=> ?::vector) as similarity_score
                FROM knowledge_base
                WHERE tenant_id = ?
                    AND embedding IS NOT NULL
                    AND is_public = true
                    AND (allowed_agents IS NULL OR array_length(allowed_agents, 1) = 0)
                    AND (1 - (embedding <=> ?::vector)) >= ?
                ORDER BY embedding <=> ?::vector
                LIMIT ?
            ", [$embeddingString, $tenantId, $embeddingString, $threshold, $embeddingString, $limit]);
        }
        
        return response()->json([
            'data' => $results,
            'query' => $queryText,
            'count' => count($results),
        ]);
    }
    
    /**
     * Full-text search
     */
    public function fullTextSearch(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'query' => 'required|string',
            'tenant_id' => 'required|uuid',
            'limit' => 'nullable|integer|min:1|max:50',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }
        
        $queryText = $request->input('query');
        $tenantId = $request->input('tenant_id');
        $limit = $request->input('limit', 10);
        
        // Full-text search using PostgreSQL tsvector
        $results = Knowledge::where('tenant_id', $tenantId)
            ->where('is_public', true)
            ->where(function($q) use ($queryText) {
                $q->whereRaw("to_tsvector('english', title || ' ' || content) @@ plainto_tsquery('english', ?)", [$queryText])
                  ->orWhere('title', 'ILIKE', "%{$queryText}%")
                  ->orWhere('content', 'ILIKE', "%{$queryText}%");
            })
            ->select([
                'id',
                'title',
                'content',
                'category',
                DB::raw("ts_rank(to_tsvector('english', title || ' ' || content), plainto_tsquery('english', ?)) as rank", [$queryText])
            ])
            ->orderBy('rank', 'desc')
            ->limit($limit)
            ->get();
        
        return response()->json([
            'data' => $results,
            'query' => $queryText,
            'count' => $results->count(),
            'type' => 'fulltext',
        ]);
    }
    
    /**
     * Hybrid search (combines semantic + full-text)
     */
    public function hybridSearch(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'query' => 'required|string',
            'tenant_id' => 'required|uuid',
            'limit' => 'nullable|integer|min:1|max:50',
            'threshold' => 'nullable|numeric|min:0|max:1',
            'semantic_weight' => 'nullable|numeric|min:0|max:1',
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
        $semanticWeight = $request->input('semantic_weight', 0.7);
        $textWeight = 1 - $semanticWeight;
        
        // Generate embedding for semantic search
        $queryEmbedding = $this->openaiService->generateEmbedding($queryText);
        
        if (!$queryEmbedding) {
            // Fallback to full-text only if embedding fails
            return $this->fullTextSearch($request);
        }
        
        $embeddingString = '[' . implode(',', $queryEmbedding) . ']';
        
        // Hybrid search: combine vector similarity with full-text rank
        try {
            $results = DB::select("
                SELECT 
                    kb.id,
                    kb.title,
                    kb.content,
                    kb.category,
                    kb.source,
                    kb.validation_status,
                    -- Normalized semantic similarity (0-1)
                    (1 - (kb.embedding <=> ?::vector)) as semantic_score,
                    -- Normalized full-text rank (0-1)
                    LEAST(ts_rank(to_tsvector('english', kb.title || ' ' || kb.content), plainto_tsquery('english', ?)) * 10, 1.0) as text_score,
                    -- Combined score
                    (
                        (1 - (kb.embedding <=> ?::vector)) * ? +
                        LEAST(ts_rank(to_tsvector('english', kb.title || ' ' || kb.content), plainto_tsquery('english', ?)) * 10, 1.0) * ?
                    ) as combined_score
                FROM knowledge_base kb
                WHERE kb.tenant_id = ?
                    AND kb.embedding IS NOT NULL
                    AND kb.is_public = true
                    AND (kb.allowed_agents IS NULL OR array_length(kb.allowed_agents, 1) = 0)
                    AND (
                        (1 - (kb.embedding <=> ?::vector)) >= ? OR
                        to_tsvector('english', kb.title || ' ' || kb.content) @@ plainto_tsquery('english', ?)
                    )
                ORDER BY combined_score DESC
                LIMIT ?
            ", [
                $embeddingString, $queryText, // semantic_score
                $embeddingString, $semanticWeight, $queryText, $textWeight, // combined_score
                $tenantId, // WHERE
                $embeddingString, $threshold, $queryText, // AND conditions
                $limit, // LIMIT
            ]);
            
            return response()->json([
                'data' => $results,
                'query' => $queryText,
                'count' => count($results),
                'type' => 'hybrid',
                'weights' => [
                    'semantic' => $semanticWeight,
                    'text' => $textWeight,
                ],
            ]);
        } catch (\Exception $e) {
            \Log::error('Hybrid search failed', ['error' => $e->getMessage()]);
            // Fallback to full-text search
            return $this->fullTextSearch($request);
        }
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
