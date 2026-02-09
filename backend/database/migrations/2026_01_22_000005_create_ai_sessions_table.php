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

        Schema::create('ai_sessions', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::getDriverName() === 'pgsql' ? DB::raw('gen_random_uuid()') : null);
            
            // Session Info
            $table->string('session_type', 50); // scheduled_report, alert_response, user_query, automated_check
            $table->string('trigger_source', 100)->nullable(); // 'scheduler', 'alert:xyz', 'user:shine', 'webhook'
            
            // Context Provided
            if (DB::getDriverName() === 'pgsql') {
                $table->jsonb('context_metrics')->nullable();
                $table->jsonb('context_alerts')->nullable();
                $table->jsonb('context_recent_actions')->nullable();
            } else {
                $table->json('context_metrics')->nullable();
                $table->json('context_alerts')->nullable();
                $table->json('context_recent_actions')->nullable();
            }
            $table->text('user_query')->nullable();
            
            // AI Processing
            $table->string('model_used', 50)->nullable();
            $table->integer('prompt_tokens')->nullable();
            $table->integer('completion_tokens')->nullable();
            
            // Output
            $table->text('analysis_summary')->nullable();
            if (DB::getDriverName() === 'pgsql') {
                $table->jsonb('recommendations')->nullable();
                $table->jsonb('actions_taken')->nullable();
            } else {
                $table->json('recommendations')->nullable();
                $table->json('actions_taken')->nullable();
            }
            $table->uuid('report_generated_id')->nullable();
            
            // Status
            $table->string('status', 20)->default('processing'); // processing, completed, failed, cancelled
            $table->text('error_message')->nullable();
            
            // Timing
            $table->timestampTz('started_at')->useCurrent();
            $table->timestampTz('completed_at')->nullable();
            $table->integer('duration_ms')->nullable();
            
            // Audit
            $table->string('created_by', 100)->nullable(); // 'system', 'user:shine', etc.
            $table->timestampTz('created_at')->useCurrent();
        });

        // Reset search path
        DB::statement('SET search_path TO public');

        // Indexes
        DB::statement('CREATE INDEX idx_ai_sessions_type_time ON ops.ai_sessions(session_type, started_at DESC)');
        DB::statement('CREATE INDEX idx_ai_sessions_status ON ops.ai_sessions(status) WHERE status = \'processing\'');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement('DROP TABLE IF EXISTS ops.ai_sessions CASCADE');
    }
};

