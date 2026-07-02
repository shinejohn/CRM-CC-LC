<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Backfill tenant_id for pre-existing (operator) users.
     *
     * Every existing user with a NULL tenant_id is a real Fibonacco operator who
     * must retain full access to the platform's imported businesses. Those
     * customers were synced under config('fibonacco.system_tenant_id'), so we
     * assign operators that same tenant. This runs AFTER the deny-by-default
     * TenantScope change, so without this backfill existing operators would
     * suddenly see nothing.
     *
     * Guarded to ONLY touch rows that are currently NULL — newly self-registered
     * users (who already have their own unique tenant) are never affected.
     */
    public function up(): void
    {
        $systemTenantId = (string) config('fibonacco.system_tenant_id');

        DB::table('users')
            ->whereNull('tenant_id')
            ->update(['tenant_id' => $systemTenantId]);
    }

    /**
     * Intentional no-op.
     *
     * We cannot safely distinguish operators that were backfilled here from any
     * user legitimately assigned to the system tenant later, so reverting to NULL
     * could strip access from real accounts. Leaving tenant_id in place on
     * rollback is the safe choice.
     */
    public function down(): void
    {
        // No-op — see docblock above.
    }
};
