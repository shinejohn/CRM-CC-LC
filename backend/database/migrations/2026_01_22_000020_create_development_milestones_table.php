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

        // Use raw SQL for UUID[] arrays
        DB::statement('
            CREATE TABLE ops.development_milestones (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                milestone_key VARCHAR(100) UNIQUE NOT NULL,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                category VARCHAR(50) NOT NULL,
                module VARCHAR(50),
                planned_start DATE,
                planned_end DATE,
                actual_start DATE,
                actual_end DATE,
                status VARCHAR(20) DEFAULT \'planned\',
                progress_percentage INTEGER DEFAULT 0,
                depends_on UUID[],
                blocks UUID[],
                owner VARCHAR(100),
                team TEXT[],
                requirements TEXT,
                acceptance_criteria JSONB,
                blockers JSONB,
                estimated_hours INTEGER,
                actual_hours INTEGER,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            )
        ');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement('DROP TABLE IF EXISTS ops.development_milestones');
    }
};

