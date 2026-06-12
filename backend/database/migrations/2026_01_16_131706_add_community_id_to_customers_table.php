<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (Schema::hasColumn('customers', 'community_id')) {
            return;
        }
        Schema::table('customers', function (Blueprint $table) {
            $table->uuid('community_id')->nullable()->after('tenant_id');
            $table->index('community_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            $table->dropIndex(['community_id']);
            $table->dropColumn('community_id');
        });
    }
};
