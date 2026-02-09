<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('newsletter_schedules');
        Schema::create('newsletter_schedules', function (Blueprint $table) {
            $table->id();
            if (Schema::hasTable('communities')) {
                $table->foreignId('community_id')->unique()->constrained('communities')->onDelete('cascade');
            } else {
                $table->foreignId('community_id')->unique();
            }
            
            // Scheduling config
            $table->string('daily_send_time', 5)->default('07:00')->comment('24h format, e.g. 07:00');
            $table->integer('weekly_send_day')->default(1)->comment('1-7 (Mon-Sun)');
            $table->string('weekly_send_time', 5)->default('08:00');
            
            // Automation
            $table->boolean('is_active')->default(true);
            $table->timestamp('last_run_at')->nullable();
            $table->timestamp('next_run_at')->nullable();
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('newsletter_schedules');
    }
};
