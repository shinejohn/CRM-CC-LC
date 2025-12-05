<?php

namespace App\Jobs;

use App\Models\Knowledge;
use App\Services\OpenAIService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class GenerateEmbedding implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public string $knowledgeId
    ) {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(OpenAIService $openaiService): void
    {
        $knowledge = Knowledge::find($this->knowledgeId);
        
        if (!$knowledge) {
            Log::warning("Knowledge item not found: {$this->knowledgeId}");
            return;
        }
        
        // Update status to processing
        $knowledge->update(['embedding_status' => 'processing']);
        
        try {
            // Generate embedding
            $textToEmbed = $knowledge->title . "\n\n" . $knowledge->content;
            $embedding = $openaiService->generateEmbedding($textToEmbed);
            
            if (!$embedding) {
                throw new \Exception('Failed to generate embedding');
            }
            
            // Store embedding as PostgreSQL vector type
            // Convert array to PostgreSQL vector format
            $embeddingString = '[' . implode(',', $embedding) . ']';
            
            DB::statement(
                'UPDATE knowledge_base SET embedding = ?::vector, embedding_status = ? WHERE id = ?',
                [$embeddingString, 'completed', $knowledge->id]
            );
            
            Log::info("Embedding generated successfully for knowledge item: {$this->knowledgeId}");
            
        } catch (\Exception $e) {
            Log::error("Failed to generate embedding for knowledge item: {$this->knowledgeId}", [
                'error' => $e->getMessage()
            ]);
            
            $knowledge->update(['embedding_status' => 'failed']);
            
            throw $e;
        }
    }
}
