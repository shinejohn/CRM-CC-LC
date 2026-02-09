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

        Schema::create('alerts', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::getDriverName() === 'pgsql' ? DB::raw('gen_random_uuid()') : null);
            
            // Reference
            $table->uuid('rule_id')->nullable();
            $table->foreign('rule_id')->references('id')->on('ops.alert_rules');
            
            // Classification
            $table->string('category', 50);
            $table->string('severity', 20); // info, warning, critical, emergency
            
            // Alert Details
            $table->string('title', 255);
            $table->text('description')->nullable();
            
            // Context
            $table->decimal('metric_value', 20, 4)->nullable();
            $table->decimal('threshold_value', 20, 4)->nullable();
            $table->uuid('component_id')->nullable();
            $table->foreign('component_id')->references('id')->on('ops.infrastructure_components');
            
            if (DB::getDriverName() === 'pgsql') {
                $table->jsonb('context_data')->nullable();
            } else {
                $table->json('context_data')->nullable();
            }
            
            // Status
            $table->string('status', 20)->default('active'); // active, acknowledged, investigating, resolved, snoozed
            
            // Timeline
            $table->timestampTz('triggered_at')->useCurrent();
            $table->timestampTz('acknowledged_at')->nullable();
            $table->string('acknowledged_by', 100)->nullable();
            $table->timestampTz('resolved_at')->nullable();
            $table->string('resolved_by', 100)->nullable();
            $table->text('resolution_notes')->nullable();
            
            // Snooze
            $table->timestampTz('snoozed_until')->nullable();
            $table->string('snoozed_by', 100)->nullable();
            $table->text('snooze_reason')->nullable();
            
            // Escalation
            $table->integer('escalation_level')->default(0);
            $table->timestampTz('escalated_at')->nullable();
            
            // Related
            $table->uuid('incident_id')->nullable();
            $table->foreign('incident_id')->references('id')->on('ops.incidents');
            
            $table->timestampTz('created_at')->useCurrent();
            $table->timestampTz('updated_at')->useCurrent()->useCurrentOnUpdate();
        });

        // Add PostgreSQL UUID[] array after table creation
        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE ops.alerts ADD COLUMN related_alert_ids UUID[]');
        }

        // Reset search path
        DB::statement('SET search_path TO public');

        // Indexes
        DB::statement('CREATE INDEX idx_alerts_status ON ops.alerts(status, severity) WHERE status = \'active\'');
        DB::statement('CREATE INDEX idx_alerts_triggered ON ops.alerts(triggered_at DESC)');
        DB::statement('CREATE INDEX idx_alerts_component ON ops.alerts(component_id) WHERE component_id IS NOT NULL');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement('DROP TABLE IF EXISTS ops.alerts CASCADE');
    }
};

