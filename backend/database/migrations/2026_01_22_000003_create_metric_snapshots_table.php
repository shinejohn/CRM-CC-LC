<?php

use Illuminate\Database\Migrations\Migration;
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

        // Create partitioned table
        DB::statement('
            CREATE TABLE ops.metric_snapshots (
                id UUID NOT NULL DEFAULT gen_random_uuid(),
                metric_id UUID NOT NULL REFERENCES ops.metric_definitions(id),
                dimension_key VARCHAR(100),
                dimension_value VARCHAR(255),
                value DECIMAL(20,4) NOT NULL,
                recorded_at TIMESTAMP WITH TIME ZONE NOT NULL,
                period_start TIMESTAMP WITH TIME ZONE,
                period_end TIMESTAMP WITH TIME ZONE,
                granularity VARCHAR(20) DEFAULT \'point\',
                metadata JSONB,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                PRIMARY KEY (id, recorded_at)
            ) PARTITION BY RANGE (recorded_at)
        ');

        // Create initial partition for January 2026
        DB::statement('
            CREATE TABLE ops.metric_snapshots_2026_01 PARTITION OF ops.metric_snapshots
            FOR VALUES FROM (\'2026-01-01\') TO (\'2026-02-01\')
        ');

        // Create partition for February 2026
        DB::statement('
            CREATE TABLE ops.metric_snapshots_2026_02 PARTITION OF ops.metric_snapshots
            FOR VALUES FROM (\'2026-02-01\') TO (\'2026-03-01\')
        ');

        // Indexes
        DB::statement('CREATE INDEX idx_metric_snapshots_metric_time ON ops.metric_snapshots(metric_id, recorded_at DESC)');
        DB::statement('CREATE INDEX idx_metric_snapshots_dimension ON ops.metric_snapshots(dimension_key, dimension_value) WHERE dimension_key IS NOT NULL');
        DB::statement('CREATE INDEX idx_metric_snapshots_granularity ON ops.metric_snapshots(granularity, recorded_at DESC)');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement('DROP TABLE IF EXISTS ops.metric_snapshots CASCADE');
    }
};

