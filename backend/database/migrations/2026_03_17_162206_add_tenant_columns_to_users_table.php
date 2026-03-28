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
        Schema::table('users', function (Blueprint $table) {
            $table->unsignedBigInteger('community_id')->nullable()->after('id');
            $table->unsignedBigInteger('smb_id')->nullable()->after('community_id');
            $table->uuid('tenant_id')->nullable()->after('smb_id');

            $table->foreign('smb_id')->references('id')->on('smbs')->nullOnDelete();
            $table->foreign('community_id')->references('id')->on('communities')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['smb_id']);
            $table->dropForeign(['community_id']);
            $table->dropColumn(['community_id', 'smb_id', 'tenant_id']);
        });
    }
};
