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
        // Only create schema if using PostgreSQL
        if (DB::getDriverName() === 'pgsql') {
            DB::statement('DROP SCHEMA IF EXISTS ops CASCADE');
            DB::statement('CREATE SCHEMA IF NOT EXISTS ops');
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (DB::getDriverName() !== 'pgsql') {
            return;
        }

        // Drop schema and all tables within it
        DB::statement('DROP SCHEMA IF EXISTS ops CASCADE');
    }
};

