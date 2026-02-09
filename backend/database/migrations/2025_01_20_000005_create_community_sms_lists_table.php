<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('community_sms_lists', function (Blueprint $table) {
            if (Schema::hasTable('communities')) {
                $table->foreignId('community_id')->primary()->constrained('communities');
            } else {
                $table->foreignId('community_id')->primary();
            }
            
            if (DB::getDriverName() === 'pgsql') {
                $table->text('alert_phones')->nullable(); // Stored as comma-separated or JSON
                $table->text('emergency_phones')->nullable();
            } else {
                $table->json('alert_phones')->nullable();
                $table->json('emergency_phones')->nullable();
            }
            
            $table->integer('alert_count')->default(0);
            $table->integer('emergency_count')->default(0);
            
            $table->timestamp('compiled_at')->nullable();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('community_sms_lists');
    }
};



