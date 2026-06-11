<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Add pp_external_id to smbs for fast batch upserts (replaces JSONB expression lookup)
        Schema::table('smbs', function (Blueprint $table) {
            $table->text('pp_external_id')->nullable();
        });

        // Backfill from metadata->>'pp_business_id'
        DB::statement("UPDATE smbs SET pp_external_id = metadata->>'pp_business_id' WHERE pp_external_id IS NULL AND metadata IS NOT NULL");

        // Deduplicate before adding unique constraint (keep newest row per pp_external_id)
        DB::statement("
            DELETE FROM smbs a
            USING smbs b
            WHERE a.pp_external_id IS NOT NULL
              AND a.pp_external_id = b.pp_external_id
              AND a.created_at < b.created_at
        ");

        Schema::table('smbs', function (Blueprint $table) {
            $table->unique('pp_external_id');
        });

        // Add unique index on customers.external_id for ON CONFLICT upserts
        Schema::table('customers', function (Blueprint $table) {
            $table->unique('external_id');
        });

        // Drop the now-redundant expression index
        DB::statement('DROP INDEX IF EXISTS smbs_metadata_pp_business_id_idx');
    }

    public function down(): void
    {
        Schema::table('smbs', function (Blueprint $table) {
            $table->dropUnique(['pp_external_id']);
            $table->dropColumn('pp_external_id');
        });

        Schema::table('customers', function (Blueprint $table) {
            $table->dropUnique(['external_id']);
        });

        // Restore expression index
        DB::statement("CREATE INDEX IF NOT EXISTS smbs_metadata_pp_business_id_idx ON smbs ((metadata->>'pp_business_id'))");
    }
};
