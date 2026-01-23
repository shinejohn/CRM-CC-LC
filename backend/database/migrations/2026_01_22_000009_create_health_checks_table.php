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
            CREATE TABLE ops.health_checks (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                component_id UUID NOT NULL REFERENCES ops.infrastructure_components(id),
                status VARCHAR(20) NOT NULL,
                response_time_ms INTEGER,
                check_type VARCHAR(50),
                endpoint_checked VARCHAR(255),
                response_code INTEGER,
                response_body_sample TEXT,
                error_message TEXT,
                checked_from VARCHAR(100),
                checked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
            ) PARTITION BY RANGE (checked_at)
        ');

        // Create initial partition for January 2026
        DB::statement('
            CREATE TABLE ops.health_checks_2026_01 PARTITION OF ops.health_checks
            FOR VALUES FROM (\'2026-01-01\') TO (\'2026-02-01\')
        ');

        // Create partition for February 2026
        DB::statement('
            CREATE TABLE ops.health_checks_2026_02 PARTITION OF ops.health_checks
            FOR VALUES FROM (\'2026-02-01\') TO (\'2026-03-01\')
        ');

        // Indexes
        DB::statement('CREATE INDEX idx_health_checks_component_time ON ops.health_checks(component_id, checked_at DESC)');
        DB::statement('CREATE INDEX idx_health_checks_status ON ops.health_checks(status, checked_at DESC) WHERE status != \'healthy\'');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement('DROP TABLE IF EXISTS ops.health_checks CASCADE');
    }
};

