<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('communities', function (Blueprint $table) {
            $table->timestamp('launched_at')->nullable()->after('settings');
            $table->integer('founder_window_days')->default(90)->after('launched_at');
        });
    }

    public function down(): void
    {
        Schema::table('communities', function (Blueprint $table) {
            $table->dropColumn(['launched_at', 'founder_window_days']);
        });
    }
};
