<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Expression index on metadata->>'pp_business_id' for fast targeted sync lookups
        DB::statement("CREATE INDEX IF NOT EXISTS smbs_metadata_pp_business_id_idx ON smbs ((metadata->>'pp_business_id'))");
    }

    public function down(): void
    {
        DB::statement('DROP INDEX IF EXISTS smbs_metadata_pp_business_id_idx');
    }
};
