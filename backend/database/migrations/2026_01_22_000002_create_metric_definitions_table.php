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

        Schema::create('metric_definitions', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::getDriverName() === 'pgsql' ? DB::raw('gen_random_uuid()') : null);
            
            // Identity
            $table->string('metric_key', 100)->unique();
            $table->string('name', 255);
            $table->text('description')->nullable();
            $table->string('category', 50); // financial, infrastructure, email, growth, system, cost
            $table->string('subcategory', 50)->nullable();
            
            // Data Type & Formatting
            $table->string('data_type', 20)->default('number'); // number, percentage, currency, duration, count
            $table->string('unit', 20)->nullable(); // USD, %, ms, count, bytes
            $table->smallInteger('decimal_places')->default(2);
            
            // Aggregation
            $table->string('aggregation_method', 20)->default('sum'); // sum, avg, min, max, last, first, count
            if (DB::getDriverName() === 'pgsql') {
                $table->jsonb('rollup_intervals')->default(DB::raw("'[\"hourly\", \"daily\", \"weekly\", \"monthly\"]'::jsonb"));
            } else {
                $table->json('rollup_intervals')->default('["hourly", "daily", "weekly", "monthly"]');
            }
            
            // Thresholds & Alerts
            $table->decimal('warning_threshold', 20, 4)->nullable();
            $table->string('warning_direction', 10)->nullable(); // 'above', 'below'
            $table->decimal('critical_threshold', 20, 4)->nullable();
            $table->string('critical_direction', 10)->nullable();
            
            // Collection
            $table->string('collection_method', 50); // realtime, scheduled, event_driven, computed
            $table->integer('collection_interval_seconds')->nullable();
            $table->string('source_table', 100)->nullable();
            $table->text('source_query')->nullable();
            
            // AI Context
            $table->string('ai_importance', 20)->default('normal'); // critical, high, normal, low
            $table->text('ai_context_notes')->nullable();
            
            // Status
            $table->boolean('is_active')->default(true);
            $table->timestampTz('created_at')->useCurrent();
            $table->timestampTz('updated_at')->useCurrent()->useCurrentOnUpdate();
        });

        // Reset search path
        DB::statement('SET search_path TO public');

        // Indexes
        DB::statement('CREATE INDEX idx_metric_defs_category ON ops.metric_definitions(category)');
        DB::statement('CREATE INDEX idx_metric_defs_key ON ops.metric_definitions(metric_key)');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement('DROP TABLE IF EXISTS ops.metric_definitions CASCADE');
    }
};

