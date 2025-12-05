<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Create update timestamp trigger function
        DB::unprepared('
            CREATE OR REPLACE FUNCTION update_updated_at()
            RETURNS TRIGGER AS $$
            BEGIN
                NEW.updated_at = NOW();
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;
        ');
        
        // Create triggers for updated_at - check if tables exist first
        $this->createTriggerIfTableExists('knowledge_base', 'update_knowledge_base_updated_at');
        $this->createTriggerIfTableExists('survey_sections', 'update_survey_sections_updated_at');
        $this->createTriggerIfTableExists('survey_questions', 'update_survey_questions_updated_at');
        
        // Create vector search function - only if vector extension is available
        try {
            DB::unprepared('
                CREATE OR REPLACE FUNCTION search_knowledge_base(
                    p_tenant_id UUID,
                    p_query_text TEXT,
                    p_query_embedding vector(1536),
                    p_limit INT DEFAULT 10,
                    p_threshold FLOAT DEFAULT 0.7
                )
                RETURNS TABLE (
                    id UUID,
                    title TEXT,
                    content TEXT,
                    category TEXT,
                    similarity_score FLOAT,
                    source VARCHAR(20),
                    validation_status VARCHAR(20)
                ) AS $$
                BEGIN
                    RETURN QUERY
                    SELECT 
                        kb.id,
                        kb.title,
                        kb.content,
                        kb.category,
                        1 - (kb.embedding <=> p_query_embedding) as similarity_score,
                        kb.source,
                        kb.validation_status
                    FROM knowledge_base kb
                    WHERE kb.tenant_id = p_tenant_id
                        AND kb.embedding IS NOT NULL
                        AND kb.is_public = true
                        AND (kb.allowed_agents IS NULL OR array_length(kb.allowed_agents, 1) = 0)
                        AND (1 - (kb.embedding <=> p_query_embedding)) >= p_threshold
                    ORDER BY kb.embedding <=> p_query_embedding
                    LIMIT p_limit;
                END;
                $$ LANGUAGE plpgsql;
            ');
        } catch (\Exception $e) {
            // Vector extension not available - skip function creation
            Log::warning('Vector search function creation skipped: ' . $e->getMessage());
        }
    }
    
    /**
     * Create trigger if table exists
     */
    private function createTriggerIfTableExists(string $table, string $triggerName): void
    {
        try {
            // Check if table exists
            $exists = DB::selectOne("
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    AND table_name = ?
                ) as exists
            ", [$table]);
            
            if ($exists && $exists->exists) {
                DB::unprepared("DROP TRIGGER IF EXISTS {$triggerName} ON {$table};");
                DB::unprepared("
                    CREATE TRIGGER {$triggerName} 
                        BEFORE UPDATE ON {$table}
                        FOR EACH ROW EXECUTE FUNCTION update_updated_at();
                ");
            }
        } catch (\Exception $e) {
            Log::warning("Trigger {$triggerName} creation skipped: " . $e->getMessage());
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::unprepared('DROP FUNCTION IF EXISTS search_knowledge_base(UUID, TEXT, vector, INT, FLOAT)');
        DB::unprepared('DROP FUNCTION IF EXISTS update_updated_at()');
    }
};
