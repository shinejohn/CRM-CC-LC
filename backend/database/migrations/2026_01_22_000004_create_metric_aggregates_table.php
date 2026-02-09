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

        Schema::create('metric_aggregates', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::getDriverName() === 'pgsql' ? DB::raw('gen_random_uuid()') : null);
            
            $table->uuid('metric_id');
            $table->string('dimension_key', 100)->nullable();
            $table->string('dimension_value', 255)->nullable();
            
            // Aggregation Period
            $table->string('period_type', 20); // hourly, daily, weekly, monthly
            $table->timestampTz('period_start');
            $table->timestampTz('period_end');
            
            // Aggregated Values
            $table->decimal('value_sum', 20, 4)->nullable();
            $table->decimal('value_avg', 20, 4)->nullable();
            $table->decimal('value_min', 20, 4)->nullable();
            $table->decimal('value_max', 20, 4)->nullable();
            $table->integer('value_count')->nullable();
            $table->decimal('value_first', 20, 4)->nullable();
            $table->decimal('value_last', 20, 4)->nullable();
            
            // Statistical
            $table->decimal('value_stddev', 20, 4)->nullable();
            $table->decimal('value_p50', 20, 4)->nullable(); // median
            $table->decimal('value_p95', 20, 4)->nullable();
            $table->decimal('value_p99', 20, 4)->nullable();
            
            // Metadata
            $table->timestampTz('computed_at')->useCurrent();
            
            // Foreign key
            $table->foreign('metric_id')->references('id')->on('ops.metric_definitions');
            
            // Unique constraint
            $table->unique(['metric_id', 'dimension_key', 'dimension_value', 'period_type', 'period_start'], 'metric_aggregates_unique');
        });

        // Reset search path
        DB::statement('SET search_path TO public');

        // Index
        DB::statement('CREATE INDEX idx_metric_aggregates_lookup ON ops.metric_aggregates(metric_id, period_type, period_start DESC)');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement('DROP TABLE IF EXISTS ops.metric_aggregates CASCADE');
    }
};

