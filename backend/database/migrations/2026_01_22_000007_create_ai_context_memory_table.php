<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (DB::getDriverName() !== 'pgsql') {
            return;
        }

        // Set search path to ops schema for table creation
        DB::statement('SET search_path TO ops, public');

        Schema::create('ai_context_memory', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::getDriverName() === 'pgsql' ? DB::raw('gen_random_uuid()') : null);
            
            // Memory Classification
            $table->string('memory_type', 50); // fact, pattern, decision, preference, goal
            $table->string('category', 50);
            
            // Content
            $table->string('key', 255);
            $table->text('content');
            if (DB::getDriverName() === 'pgsql') {
                $table->jsonb('structured_data')->nullable();
            } else {
                $table->json('structured_data')->nullable();
            }
            
            // Importance & Relevance
            $table->decimal('importance_score', 3, 2)->default(0.50); // 0.00 to 1.00
            $table->integer('access_count')->default(0);
            $table->timestampTz('last_accessed_at')->nullable();
            
            // Source
            $table->uuid('source_session_id')->nullable();
            $table->foreign('source_session_id')->references('id')->on('ops.ai_sessions');
            $table->string('source_type', 50)->nullable(); // user_input, ai_derived, system_event
            
            // Validity
            $table->boolean('is_active')->default(true);
            $table->timestampTz('valid_from')->useCurrent();
            $table->timestampTz('valid_until')->nullable();
            
            // Versioning
            $table->integer('version')->default(1);
            $table->uuid('previous_version_id')->nullable();
            $table->foreign('previous_version_id')->references('id')->on('ops.ai_context_memory');
            
            $table->timestampTz('created_at')->useCurrent();
            $table->timestampTz('updated_at')->useCurrent()->useCurrentOnUpdate();
            
            // Unique constraint
            $table->unique(['key', 'version'], 'ai_context_memory_key_version_unique');
        });

        // Reset search path
        DB::statement('SET search_path TO public');

        // Indexes
        DB::statement('CREATE INDEX idx_ai_memory_type_cat ON ops.ai_context_memory(memory_type, category) WHERE is_active = TRUE');
        DB::statement('CREATE INDEX idx_ai_memory_key ON ops.ai_context_memory(key) WHERE is_active = TRUE');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement('DROP TABLE IF EXISTS ops.ai_context_memory CASCADE');
    }
};

