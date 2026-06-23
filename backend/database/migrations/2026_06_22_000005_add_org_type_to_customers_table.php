<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('customers', function (Blueprint $table): void {
            if (! Schema::hasColumn('customers', 'org_type')) {
                $table->string('org_type')->nullable()->index();
            }

            if (! Schema::hasColumn('customers', 'org_subtype')) {
                $table->string('org_subtype')->nullable();
            }
        });
    }

    public function down(): void
    {
        Schema::table('customers', function (Blueprint $table): void {
            if (Schema::hasColumn('customers', 'org_type')) {
                $table->dropIndex(['org_type']);
                $table->dropColumn('org_type');
            }

            if (Schema::hasColumn('customers', 'org_subtype')) {
                $table->dropColumn('org_subtype');
            }
        });
    }
};
