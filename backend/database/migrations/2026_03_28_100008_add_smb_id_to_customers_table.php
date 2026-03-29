<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            if (! Schema::hasColumn('customers', 'smb_id')) {
                $table->unsignedBigInteger('smb_id')->nullable()->after('community_id');
                $table->foreign('smb_id')->references('id')->on('smbs')->nullOnDelete();
                $table->index('smb_id');
            }
        });
    }

    public function down(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            if (Schema::hasColumn('customers', 'smb_id')) {
                $table->dropForeign(['smb_id']);
                $table->dropColumn('smb_id');
            }
        });
    }
};
