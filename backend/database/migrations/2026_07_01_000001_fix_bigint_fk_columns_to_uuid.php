<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Prod-only repair migration.
 *
 * On the existing PostgreSQL prod DB these FK columns were created as bigint,
 * but their parents (smbs.id, communities.id, users.id, message_queue.id) are
 * uuid. The original create-migrations have been fixed to emit uuid from the
 * start, so on any FRESH database (SQLite tests + fresh Postgres) these columns
 * are already uuid and this migration is a driver-guarded no-op.
 *
 * bigint values cannot be cast to uuid (Postgres has no such cast), and any
 * value ever written to these drift columns is a meaningless integer that can
 * never match a uuid parent key — so we convert via `NULL::uuid`, discarding
 * the unusable integer data.
 */
return new class extends Migration
{
    /**
     * @var array<int, array{table: string, column: string}>
     */
    private array $columns = [
        ['table' => 'analytics_events',   'column' => 'smb_id'],
        ['table' => 'analytics_events',   'column' => 'community_id'],
        ['table' => 'chat_messages',      'column' => 'smb_id'],
        ['table' => 'email_conversations','column' => 'smb_id'],
        ['table' => 'unsubscribe_tokens', 'column' => 'scope_id'],
        ['table' => 'suppression_list',   'column' => 'community_id'],
        ['table' => 'alert_sends',        'column' => 'email_message_id'],
        ['table' => 'alert_sends',        'column' => 'sms_message_id'],
        ['table' => 'alert_sends',        'column' => 'push_message_id'],
        // SESSION_DRIVER=database writes the authenticated uuid user id here;
        // prod created this as bigint (foreignId) and must be widened to uuid.
        ['table' => 'sessions',           'column' => 'user_id'],
    ];

    public function up(): void
    {
        if (DB::getDriverName() !== 'pgsql') {
            return; // Fresh DBs already have uuid from the create-migrations.
        }

        foreach ($this->columns as $col) {
            if (! Schema::hasColumn($col['table'], $col['column'])) {
                continue;
            }

            DB::statement(sprintf(
                'ALTER TABLE %s ALTER COLUMN %s DROP DEFAULT, ALTER COLUMN %s TYPE uuid USING NULL::uuid',
                $col['table'],
                $col['column'],
                $col['column'],
            ));
        }
    }

    public function down(): void
    {
        if (DB::getDriverName() !== 'pgsql') {
            return;
        }

        foreach ($this->columns as $col) {
            if (! Schema::hasColumn($col['table'], $col['column'])) {
                continue;
            }

            DB::statement(sprintf(
                'ALTER TABLE %s ALTER COLUMN %s TYPE bigint USING NULL::bigint',
                $col['table'],
                $col['column'],
            ));
        }
    }
};
