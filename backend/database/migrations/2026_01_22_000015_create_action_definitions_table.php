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

        Schema::create('action_definitions', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::getDriverName() === 'pgsql' ? DB::raw('gen_random_uuid()') : null);
            
            // Identity
            $table->string('action_key', 100)->unique();
            $table->string('name', 255);
            $table->text('description')->nullable();
            
            // Classification
            $table->string('category', 50); // infrastructure, email, campaign, financial, notification
            $table->string('risk_level', 20); // low, medium, high, critical
            
            // Execution
            $table->string('handler_class', 255);
            if (DB::getDriverName() === 'pgsql') {
                $table->jsonb('default_params')->nullable();
                $table->jsonb('auto_approve_conditions')->nullable();
            } else {
                $table->json('default_params')->nullable();
                $table->json('auto_approve_conditions')->nullable();
            }
            
            // Approval
            $table->boolean('requires_approval')->default(false);
            
            // Limits
            $table->integer('max_executions_per_hour')->nullable();
            $table->integer('max_executions_per_day')->nullable();
            $table->integer('cooldown_seconds')->nullable();
            
            // Rollback
            $table->boolean('is_reversible')->default(false);
            $table->string('rollback_handler_class', 255)->nullable();
            
            // Status
            $table->boolean('is_active')->default(true);
            
            $table->timestampTz('created_at')->useCurrent();
            $table->timestampTz('updated_at')->useCurrent()->useCurrentOnUpdate();
        });

        // Reset search path
        DB::statement('SET search_path TO public');

        // Add PostgreSQL TEXT[] arrays after table creation
        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE ops.action_definitions ADD COLUMN required_params TEXT[]');
            DB::statement('ALTER TABLE ops.action_definitions ADD COLUMN prerequisite_checks TEXT[]');
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement('DROP TABLE IF EXISTS ops.action_definitions CASCADE');
    }
};

