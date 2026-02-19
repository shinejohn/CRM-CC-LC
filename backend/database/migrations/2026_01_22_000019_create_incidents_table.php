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

        // Use raw SQL for SERIAL and UUID[] array
        DB::statement('
            CREATE TABLE ops.incidents (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                incident_number SERIAL,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                severity VARCHAR(20) NOT NULL,
                category VARCHAR(50),
                impact_description TEXT,
                affected_components UUID[],
                affected_communities INTEGER,
                affected_customers INTEGER,
                status VARCHAR(20) NOT NULL DEFAULT \'investigating\',
                started_at TIMESTAMP WITH TIME ZONE NOT NULL,
                identified_at TIMESTAMP WITH TIME ZONE,
                resolved_at TIMESTAMP WITH TIME ZONE,
                lead_responder VARCHAR(100),
                responders TEXT[],
                public_message TEXT,
                internal_notes TEXT,
                status_page_id VARCHAR(100),
                postmortem_url TEXT,
                root_cause TEXT,
                corrective_actions JSONB,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            )
        ');

        // Indexes
        DB::statement('CREATE INDEX idx_incidents_status ON ops.incidents(status) WHERE status NOT IN (\'resolved\', \'postmortem\')');
        DB::statement('CREATE INDEX idx_incidents_started ON ops.incidents(started_at DESC)');

        // Add FK from alerts to incidents (alerts created before incidents)
        DB::statement('ALTER TABLE ops.alerts ADD CONSTRAINT alerts_incident_id_foreign FOREIGN KEY (incident_id) REFERENCES ops.incidents(id)');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement('DROP TABLE IF EXISTS ops.incidents');
    }
};

