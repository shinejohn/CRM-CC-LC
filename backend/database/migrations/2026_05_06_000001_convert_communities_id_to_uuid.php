<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Convert communities.id from bigint (auto-increment) to uuid.
 *
 * The Community model uses HasUuids, but the original migration used $table->id()
 * which creates a bigint auto-increment column. All foreign keys referencing
 * communities.id also need to be converted from bigint to uuid.
 *
 * Safe to run because CC production communities table is empty (May 2026).
 */
return new class extends Migration
{
    /**
     * Tables with a community_id FK pointing to communities.id.
     * Each entry: [table, column, has_fk_constraint, fk_action]
     */
    private function fkTables(): array
    {
        return [
            ['customers', 'community_id', true, 'SET NULL'],
            ['community_subscriptions', 'community_id', true, 'RESTRICT'],
            ['community_slot_inventory', 'community_id', true, 'CASCADE'],
            ['pitch_sessions', 'community_id', true, 'CASCADE'],
            ['pitch_events', 'community_id', true, 'CASCADE'],
            ['users', 'community_id', true, 'SET NULL'],
            ['business_directory', 'community_id', true, 'SET NULL'],
            ['newsletters', 'community_id', true, 'CASCADE'],
            ['community_email_lists', 'community_id', true, 'RESTRICT'],
            ['newsletter_schedules', 'community_id', true, 'CASCADE'],
            ['sponsorships', 'community_id', true, 'CASCADE'],
            ['smbs', 'community_id', true, 'CASCADE'],
            ['cssn_smb_reports', 'community_id', true, 'CASCADE'],
            ['advertiser_sessions', 'community_id', true, 'CASCADE'],
            ['municipal_admins', 'community_id', true, 'CASCADE'],
            ['cssn_subscriptions', 'community_id', true, 'CASCADE'],
            ['community_slot_limits', 'community_id', true, 'CASCADE'],
            ['influencer_waitlist', 'community_id', true, 'CASCADE'],
        ];
    }

    public function up(): void
    {
        // This migration uses PostgreSQL-specific DDL; skip on other drivers (e.g. SQLite tests).
        if (DB::getDriverName() !== 'pgsql') {
            return;
        }

        // Step 1: Drop all foreign key constraints referencing communities.id
        foreach ($this->fkTables() as [$table, $column, $hasFk]) {
            if (! Schema::hasTable($table) || ! Schema::hasColumn($table, $column)) {
                continue;
            }

            if ($hasFk) {
                $this->dropFkIfExists($table, $column);
            }
        }

        // Step 2: Convert community_id columns from bigint to uuid (text)
        foreach ($this->fkTables() as [$table, $column]) {
            if (! Schema::hasTable($table) || ! Schema::hasColumn($table, $column)) {
                continue;
            }

            DB::statement("ALTER TABLE \"{$table}\" ALTER COLUMN \"{$column}\" DROP DEFAULT");
            DB::statement("ALTER TABLE \"{$table}\" ALTER COLUMN \"{$column}\" TYPE uuid USING NULL");
        }

        // Step 3: Convert communities.id from bigint to uuid
        // Drop the sequence/default first, then change type
        DB::statement('ALTER TABLE "communities" ALTER COLUMN "id" DROP DEFAULT');

        // Drop the auto-increment sequence if it exists
        $seqName = 'communities_id_seq';
        DB::statement("DROP SEQUENCE IF EXISTS \"{$seqName}\" CASCADE");

        DB::statement('ALTER TABLE "communities" ALTER COLUMN "id" TYPE uuid USING gen_random_uuid()');

        // Step 4: Re-add foreign key constraints
        foreach ($this->fkTables() as [$table, $column, $hasFk, $fkAction]) {
            if (! $hasFk || ! Schema::hasTable($table) || ! Schema::hasColumn($table, $column)) {
                continue;
            }

            $constraintName = "{$table}_{$column}_foreign";
            $onDelete = $fkAction ?? 'RESTRICT';

            DB::statement("
                ALTER TABLE \"{$table}\"
                ADD CONSTRAINT \"{$constraintName}\"
                FOREIGN KEY (\"{$column}\")
                REFERENCES \"communities\" (\"id\")
                ON DELETE {$onDelete}
            ");
        }
    }

    public function down(): void
    {
        // Reverse: convert back to bigint (destructive, only works if tables are empty)
        foreach ($this->fkTables() as [$table, $column, $hasFk]) {
            if (! Schema::hasTable($table) || ! Schema::hasColumn($table, $column)) {
                continue;
            }

            if ($hasFk) {
                $this->dropFkIfExists($table, $column);
            }
        }

        foreach ($this->fkTables() as [$table, $column]) {
            if (! Schema::hasTable($table) || ! Schema::hasColumn($table, $column)) {
                continue;
            }

            DB::statement("ALTER TABLE \"{$table}\" ALTER COLUMN \"{$column}\" TYPE bigint USING NULL");
        }

        DB::statement('CREATE SEQUENCE IF NOT EXISTS "communities_id_seq"');
        DB::statement('ALTER TABLE "communities" ALTER COLUMN "id" TYPE bigint USING NULL');
        DB::statement("ALTER TABLE \"communities\" ALTER COLUMN \"id\" SET DEFAULT nextval('communities_id_seq')");

        foreach ($this->fkTables() as [$table, $column, $hasFk, $fkAction]) {
            if (! $hasFk || ! Schema::hasTable($table) || ! Schema::hasColumn($table, $column)) {
                continue;
            }

            $constraintName = "{$table}_{$column}_foreign";
            $onDelete = $fkAction ?? 'RESTRICT';

            DB::statement("
                ALTER TABLE \"{$table}\"
                ADD CONSTRAINT \"{$constraintName}\"
                FOREIGN KEY (\"{$column}\")
                REFERENCES \"communities\" (\"id\")
                ON DELETE {$onDelete}
            ");
        }
    }

    private function dropFkIfExists(string $table, string $column): void
    {
        $constraintName = "{$table}_{$column}_foreign";

        $exists = DB::selectOne("
            SELECT 1 FROM information_schema.table_constraints
            WHERE constraint_name = ? AND table_name = ?
        ", [$constraintName, $table]);

        if ($exists) {
            DB::statement("ALTER TABLE \"{$table}\" DROP CONSTRAINT \"{$constraintName}\"");
        }
    }
};
