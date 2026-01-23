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

        Schema::create('alert_rules', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
            
            // Identity
            $table->string('rule_key', 100)->unique();
            $table->string('name', 255);
            $table->text('description')->nullable();
            
            // Classification
            $table->string('category', 50);
            $table->string('severity', 20); // info, warning, critical, emergency
            
            // Trigger Conditions
            $table->uuid('metric_id')->nullable();
            $table->foreign('metric_id')->references('id')->on('ops.metric_definitions');
            $table->uuid('component_id')->nullable();
            $table->foreign('component_id')->references('id')->on('ops.infrastructure_components');
            
            $table->string('condition_type', 50); // threshold, anomaly, absence, rate_of_change
            $table->string('condition_operator', 20)->nullable(); // gt, lt, gte, lte, eq, neq
            $table->decimal('condition_value', 20, 4)->nullable();
            $table->integer('condition_window_seconds')->nullable();
            $table->text('condition_query')->nullable();
            
            // Notification
            if (DB::getDriverName() === 'pgsql') {
                $table->jsonb('notification_recipients')->nullable();
                $table->jsonb('auto_action_params')->nullable();
            } else {
                $table->json('notification_channels')->nullable();
                $table->json('notification_recipients')->nullable();
                $table->json('auto_action_params')->nullable();
            }
            $table->text('notification_template')->nullable();
            
            // Timing
            $table->integer('evaluation_interval_seconds')->default(60);
            $table->integer('cooldown_seconds')->default(300);
            
            // Auto-Actions
            $table->uuid('auto_action_id')->nullable();
            $table->foreign('auto_action_id')->references('id')->on('ops.action_definitions');
            
            // Status
            $table->boolean('is_active')->default(true);
            $table->timestampTz('last_triggered_at')->nullable();
            
            $table->timestampTz('created_at')->useCurrent();
            $table->timestampTz('updated_at')->useCurrent()->useCurrentOnUpdate();
        });

        // Reset search path
        DB::statement('SET search_path TO public');

        // Add PostgreSQL TEXT[] array after table creation
        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE ops.alert_rules ADD COLUMN notification_channels TEXT[]');
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement('DROP TABLE IF EXISTS ops.alert_rules CASCADE');
    }
};

