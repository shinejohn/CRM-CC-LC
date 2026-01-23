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

        Schema::create('action_executions', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
            
            // References
            $table->uuid('action_id');
            $table->foreign('action_id')->references('id')->on('ops.action_definitions');
            $table->uuid('recommendation_id')->nullable();
            $table->foreign('recommendation_id')->references('id')->on('ops.ai_recommendations');
            $table->uuid('session_id')->nullable();
            $table->foreign('session_id')->references('id')->on('ops.ai_sessions');
            
            // Execution Details
            if (DB::getDriverName() === 'pgsql') {
                $table->jsonb('params');
                $table->jsonb('result')->nullable();
                $table->jsonb('error_details')->nullable();
                $table->jsonb('rollback_result')->nullable();
            } else {
                $table->json('params');
                $table->json('result')->nullable();
                $table->json('error_details')->nullable();
                $table->json('rollback_result')->nullable();
            }
            
            // Status
            $table->string('status', 20)->default('pending'); // pending, running, completed, failed, rolled_back
            
            // Timing
            $table->timestampTz('scheduled_for')->nullable();
            $table->timestampTz('started_at')->nullable();
            $table->timestampTz('completed_at')->nullable();
            $table->integer('duration_ms')->nullable();
            
            // Result
            $table->text('error_message')->nullable();
            
            // Rollback
            $table->timestampTz('rolled_back_at')->nullable();
            $table->text('rollback_reason')->nullable();
            
            // Audit
            $table->string('initiated_by', 100); // 'ai', 'user:shine', 'scheduler'
            $table->string('approved_by', 100)->nullable();
            $table->timestampTz('approved_at')->nullable();
            
            $table->timestampTz('created_at')->useCurrent();
            $table->timestampTz('updated_at')->useCurrent()->useCurrentOnUpdate();
        });

        // Reset search path
        DB::statement('SET search_path TO public');

        // Indexes
        DB::statement('CREATE INDEX idx_action_executions_action_time ON ops.action_executions(action_id, created_at DESC)');
        DB::statement('CREATE INDEX idx_action_executions_status ON ops.action_executions(status) WHERE status IN (\'pending\', \'running\')');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement('DROP TABLE IF EXISTS ops.action_executions CASCADE');
    }
};

