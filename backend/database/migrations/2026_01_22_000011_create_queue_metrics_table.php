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

        // Create partitioned table (PK must include partition key for PostgreSQL)
        DB::statement('
            CREATE TABLE ops.queue_metrics (
                id UUID NOT NULL DEFAULT gen_random_uuid(),
                queue_name VARCHAR(100) NOT NULL,
                queue_type VARCHAR(50) NOT NULL,
                priority VARCHAR(10),
                current_depth INTEGER NOT NULL,
                depth_24h_avg INTEGER,
                depth_24h_max INTEGER,
                messages_in_1h INTEGER,
                messages_out_1h INTEGER,
                messages_failed_1h INTEGER,
                avg_processing_time_ms INTEGER,
                p95_processing_time_ms INTEGER,
                p99_processing_time_ms INTEGER,
                oldest_message_age_seconds INTEGER,
                active_consumers INTEGER,
                consumer_utilization DECIMAL(5,2),
                status VARCHAR(20) DEFAULT \'healthy\',
                recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                PRIMARY KEY (id, recorded_at)
            ) PARTITION BY RANGE (recorded_at)
        ');

        // Create initial partition for January 2026
        DB::statement('
            CREATE TABLE ops.queue_metrics_2026_01 PARTITION OF ops.queue_metrics
            FOR VALUES FROM (\'2026-01-01\') TO (\'2026-02-01\')
        ');

        // Create partition for February 2026
        DB::statement('
            CREATE TABLE ops.queue_metrics_2026_02 PARTITION OF ops.queue_metrics
            FOR VALUES FROM (\'2026-02-01\') TO (\'2026-03-01\')
        ');

        // Indexes
        DB::statement('CREATE INDEX idx_queue_metrics_name_time ON ops.queue_metrics(queue_name, recorded_at DESC)');
        DB::statement('CREATE INDEX idx_queue_metrics_status ON ops.queue_metrics(status, recorded_at DESC) WHERE status != \'healthy\'');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement('DROP TABLE IF EXISTS ops.queue_metrics CASCADE');
    }
};

