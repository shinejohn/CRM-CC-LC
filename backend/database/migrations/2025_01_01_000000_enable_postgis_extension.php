<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() !== 'pgsql') {
            return;
        }

        try {
            DB::statement('CREATE EXTENSION IF NOT EXISTS postgis');
        } catch (\Exception $e) {
            Log::warning('PostGIS extension creation skipped: ' . $e->getMessage());
        }
    }

    public function down(): void
    {
        // Intentionally no-op: keep extension if it exists.
    }
};

