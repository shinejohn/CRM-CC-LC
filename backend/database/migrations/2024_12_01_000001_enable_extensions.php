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
        // Enable PostgreSQL extensions
        DB::statement('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
        DB::statement('CREATE EXTENSION IF NOT EXISTS "pg_trgm"');
        
        // Try to enable vector extension (may not be available on all PostgreSQL instances)
        try {
            DB::statement('CREATE EXTENSION IF NOT EXISTS "vector"');
        } catch (\Exception $e) {
            // Vector extension not available - this is okay for now
            // Can be enabled later when pgvector is installed on the server
            \Log::warning('Vector extension not available: ' . $e->getMessage());
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Note: Extensions are typically not dropped
        // DB::statement('DROP EXTENSION IF EXISTS "vector"');
        // DB::statement('DROP EXTENSION IF EXISTS "pg_trgm"');
        // DB::statement('DROP EXTENSION IF EXISTS "uuid-ossp"');
    }
};

