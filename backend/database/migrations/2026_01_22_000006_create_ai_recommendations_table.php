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

        Schema::create('ai_recommendations', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
            
            // Reference
            $table->uuid('session_id')->nullable();
            $table->foreign('session_id')->references('id')->on('ops.ai_sessions');
            
            // Recommendation Details
            $table->string('category', 50); // infrastructure, financial, growth, cost_optimization, risk_mitigation
            $table->string('priority', 20); // critical, high, medium, low
            $table->string('title', 255);
            $table->text('description');
            $table->text('rationale')->nullable();
            
            // Supporting Data
            if (DB::getDriverName() === 'pgsql') {
                $table->jsonb('supporting_metrics')->nullable();
                $table->jsonb('projected_impact')->nullable();
                $table->jsonb('suggested_action_params')->nullable();
                $table->jsonb('execution_result')->nullable();
            } else {
                $table->json('supporting_metrics')->nullable();
                $table->json('projected_impact')->nullable();
                $table->json('suggested_action_params')->nullable();
                $table->json('execution_result')->nullable();
            }
            $table->decimal('confidence_score', 3, 2)->nullable(); // 0.00 to 1.00
            
            // Action
            $table->string('suggested_action_type', 50)->nullable();
            $table->boolean('requires_approval')->default(true);
            $table->timestampTz('auto_execute_after')->nullable();
            
            // Status
            $table->string('status', 20)->default('pending'); // pending, approved, rejected, executed, expired
            $table->string('reviewed_by', 100)->nullable();
            $table->timestampTz('reviewed_at')->nullable();
            $table->text('review_notes')->nullable();
            
            // Execution
            $table->timestampTz('executed_at')->nullable();
            
            // Validity
            $table->timestampTz('valid_until')->nullable();
            $table->uuid('superseded_by')->nullable();
            $table->foreign('superseded_by')->references('id')->on('ops.ai_recommendations');
            
            $table->timestampTz('created_at')->useCurrent();
            $table->timestampTz('updated_at')->useCurrent()->useCurrentOnUpdate();
        });

        // Reset search path
        DB::statement('SET search_path TO public');

        // Indexes
        DB::statement('CREATE INDEX idx_ai_recommendations_status ON ops.ai_recommendations(status, priority)');
        DB::statement('CREATE INDEX idx_ai_recommendations_category ON ops.ai_recommendations(category, created_at DESC)');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement('DROP TABLE IF EXISTS ops.ai_recommendations CASCADE');
    }
};

