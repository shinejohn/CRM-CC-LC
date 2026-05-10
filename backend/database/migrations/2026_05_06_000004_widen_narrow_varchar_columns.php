<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Widen varchar columns that are too narrow for real-world PP data.
 *
 * - customers.slug: varchar(100) → varchar(255) — long business names generate long slugs
 * - smbs.state: varchar(2) → varchar(100) — PP has full state names, not just abbreviations
 */
return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() !== 'pgsql') {
            return;
        }

        DB::statement('ALTER TABLE "customers" ALTER COLUMN "slug" TYPE varchar(255)');
        DB::statement('ALTER TABLE "smbs" ALTER COLUMN "state" TYPE varchar(100)');
    }

    public function down(): void
    {
        if (DB::getDriverName() !== 'pgsql') {
            return;
        }

        DB::statement('ALTER TABLE "customers" ALTER COLUMN "slug" TYPE varchar(100)');
        DB::statement('ALTER TABLE "smbs" ALTER COLUMN "state" TYPE varchar(2)');
    }
};
