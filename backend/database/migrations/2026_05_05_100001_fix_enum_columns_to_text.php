<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Convert all ENUM columns to TEXT for PostgreSQL compatibility.
     * PostgreSQL does not support Laravel's ->enum() column type natively;
     * it creates a CHECK constraint that is fragile and non-standard.
     * TEXT columns with application-level validation are the correct approach.
     */
    public function up(): void
    {
        $enumColumns = [
            // cssn_subscriptions
            ['cssn_subscriptions', 'tier'],
            ['cssn_subscriptions', 'mode'],
            ['cssn_subscriptions', 'status'],
            ['cssn_subscriptions', 'billing_interval'],

            // social_studio tables
            ['social_studio_scheduled_posts', 'status'],
            ['social_studio_credit_transactions', 'type'],
            ['social_studio_content', 'content_type'],
            ['social_studio_content', 'status'],
            ['social_studio_connected_accounts', 'platform'],
            ['social_studio_connected_accounts', 'status'],
            ['social_studio_subscriptions', 'status'],

            // outbound
            ['outbound_campaigns', 'status'],
            ['campaign_recipients', 'status'],

            // content workflow
            ['content_items', 'status'],
            ['content_workflow_histories', 'action'],

            // ai personalities
            ['ai_personalities', 'status'],

            // ads
            ['generated_ads', 'status'],

            // customers
            ['customers', 'campaign_status'],
        ];

        // This migration uses PostgreSQL-specific DDL; skip on other drivers (e.g. SQLite tests).
        if (DB::getDriverName() !== 'pgsql') {
            return;
        }

        foreach ($enumColumns as [$table, $column]) {
            if (Schema::hasTable($table) && Schema::hasColumn($table, $column)) {
                DB::statement("ALTER TABLE \"{$table}\" ALTER COLUMN \"{$column}\" TYPE text");

                // Drop any CHECK constraints that Laravel's enum() created
                $constraints = DB::select("
                    SELECT con.conname
                    FROM pg_constraint con
                    JOIN pg_attribute att ON att.attnum = ANY(con.conkey)
                        AND att.attrelid = con.conrelid
                    WHERE con.conrelid = '\"{$table}\"'::regclass
                        AND att.attname = ?
                        AND con.contype = 'c'
                ", [$column]);

                foreach ($constraints as $constraint) {
                    DB::statement("ALTER TABLE \"{$table}\" DROP CONSTRAINT \"{$constraint->conname}\"");
                }
            }
        }
    }

    public function down(): void
    {
        // Re-creating ENUM constraints is intentionally omitted.
        // The forward migration removes a PostgreSQL anti-pattern.
        // Application-level validation (model casts, form requests) enforces allowed values.
    }
};
