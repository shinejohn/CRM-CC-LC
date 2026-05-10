<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Make communities.state nullable and increase size to varchar(100).
 *
 * PP communities include neighborhoods and regions that may not have a state
 * value, and some have full state names rather than 2-char abbreviations.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() !== 'pgsql') {
            return;
        }

        DB::statement('ALTER TABLE "communities" ALTER COLUMN "state" DROP NOT NULL');
        DB::statement('ALTER TABLE "communities" ALTER COLUMN "state" TYPE varchar(100)');
    }

    public function down(): void
    {
        if (DB::getDriverName() !== 'pgsql') {
            return;
        }

        DB::statement("UPDATE \"communities\" SET \"state\" = '' WHERE \"state\" IS NULL");
        DB::statement('ALTER TABLE "communities" ALTER COLUMN "state" TYPE varchar(2)');
        DB::statement('ALTER TABLE "communities" ALTER COLUMN "state" SET NOT NULL');
    }
};
