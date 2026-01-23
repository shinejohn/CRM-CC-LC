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

        // Use raw SQL for INET type
        DB::statement('
            CREATE TABLE ops.email_ip_reputation (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                ip_address INET NOT NULL,
                ip_pool VARCHAR(50) NOT NULL,
                provider VARCHAR(50) NOT NULL,
                reputation_score DECIMAL(5,2),
                gmail_reputation VARCHAR(20),
                microsoft_reputation VARCHAR(20),
                yahoo_reputation VARCHAR(20),
                emails_sent_24h INTEGER DEFAULT 0,
                emails_sent_7d INTEGER DEFAULT 0,
                emails_sent_30d INTEGER DEFAULT 0,
                bounce_rate_24h DECIMAL(5,4),
                bounce_rate_7d DECIMAL(5,4),
                bounce_rate_30d DECIMAL(5,4),
                complaint_rate_24h DECIMAL(5,4),
                complaint_rate_7d DECIMAL(5,4),
                complaint_rate_30d DECIMAL(5,4),
                open_rate_24h DECIMAL(5,4),
                open_rate_7d DECIMAL(5,4),
                warmup_status VARCHAR(20),
                warmup_started_at TIMESTAMP WITH TIME ZONE,
                warmup_target_daily_volume INTEGER,
                warmup_current_daily_limit INTEGER,
                warmup_day_number INTEGER,
                is_blacklisted BOOLEAN DEFAULT FALSE,
                blacklist_sources JSONB DEFAULT \'[]\'::jsonb,
                last_blacklist_check TIMESTAMP WITH TIME ZONE,
                is_active BOOLEAN DEFAULT TRUE,
                status VARCHAR(20) DEFAULT \'active\',
                recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            )
        ');

        // Indexes
        DB::statement('CREATE INDEX idx_email_ip_rep_pool ON ops.email_ip_reputation(ip_pool, status)');
        DB::statement('CREATE INDEX idx_email_ip_rep_address ON ops.email_ip_reputation(ip_address)');
        DB::statement('CREATE INDEX idx_email_ip_rep_warmup ON ops.email_ip_reputation(warmup_status) WHERE warmup_status = \'warming\'');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement('DROP TABLE IF EXISTS ops.email_ip_reputation');
    }
};

