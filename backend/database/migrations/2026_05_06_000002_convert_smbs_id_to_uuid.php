<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Convert smbs.id from bigint (auto-increment) to uuid.
 *
 * The SMB model uses HasUuids, but the original migration used $table->id()
 * which creates a bigint auto-increment column.
 *
 * Safe to run because CC production smbs table is empty (May 2026).
 */
return new class extends Migration
{
    /**
     * Tables with FK columns pointing to smbs.id.
     * [table, column, has_fk_constraint, fk_action]
     */
    private function fkTables(): array
    {
        return [
            ['customers', 'smb_id', true, 'SET NULL'],
            ['pitch_sessions', 'smb_id', true, 'SET NULL'],
            ['pitch_events', 'smb_id', true, 'SET NULL'],
            ['pitch_reengagement_queue', 'smb_id', true, 'SET NULL'],
            ['social_studio_credit_transactions', 'smb_id', true, 'CASCADE'],
            ['social_studio_connected_accounts', 'smb_id', true, 'CASCADE'],
            ['users', 'smb_id', true, 'SET NULL'],
            ['callbacks', 'smb_id', false, null],
            ['content_views', 'smb_id', false, null],
            ['advertiser_sessions', 'business_id', true, 'SET NULL'],
            ['sarah_messages', 'business_id', true, 'SET NULL'],
        ];
    }

    public function up(): void
    {
        // Step 1: Drop FK constraints
        foreach ($this->fkTables() as [$table, $column, $hasFk]) {
            if (! Schema::hasTable($table) || ! Schema::hasColumn($table, $column)) {
                continue;
            }

            if ($hasFk) {
                $this->dropFkIfExists($table, $column);
            }
        }

        // Step 2: Convert FK columns from bigint to uuid
        foreach ($this->fkTables() as [$table, $column]) {
            if (! Schema::hasTable($table) || ! Schema::hasColumn($table, $column)) {
                continue;
            }

            DB::statement("ALTER TABLE \"{$table}\" ALTER COLUMN \"{$column}\" DROP DEFAULT");
            DB::statement("ALTER TABLE \"{$table}\" ALTER COLUMN \"{$column}\" TYPE uuid USING NULL");
        }

        // Step 3: Convert smbs.id from bigint to uuid
        DB::statement('ALTER TABLE "smbs" ALTER COLUMN "id" DROP DEFAULT');
        DB::statement('DROP SEQUENCE IF EXISTS "smbs_id_seq" CASCADE');
        DB::statement('ALTER TABLE "smbs" ALTER COLUMN "id" TYPE uuid USING gen_random_uuid()');

        // Also drop the old uuid column since id is now uuid
        if (Schema::hasColumn('smbs', 'uuid')) {
            Schema::table('smbs', function ($table) {
                $table->dropColumn('uuid');
            });
        }

        // Step 4: Re-add FK constraints
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
                REFERENCES \"smbs\" (\"id\")
                ON DELETE {$onDelete}
            ");
        }
    }

    public function down(): void
    {
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

        DB::statement('CREATE SEQUENCE IF NOT EXISTS "smbs_id_seq"');
        DB::statement('ALTER TABLE "smbs" ALTER COLUMN "id" TYPE bigint USING NULL');
        DB::statement("ALTER TABLE \"smbs\" ALTER COLUMN \"id\" SET DEFAULT nextval('smbs_id_seq')");

        // Re-add uuid column
        if (! Schema::hasColumn('smbs', 'uuid')) {
            Schema::table('smbs', function ($table) {
                $table->uuid('uuid')->unique()->nullable();
            });
        }

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
                REFERENCES \"smbs\" (\"id\")
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
