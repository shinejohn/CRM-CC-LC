<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('newsletter_schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('community_id')->unique()->constrained('communities')->onDelete('cascade');
            
            // Daily newsletter
            $table->boolean('daily_enabled')->default(true);
            $table->time('daily_send_time')->default('06:00:00')->comment('Local time');
            $table->foreignId('daily_template_id')->nullable()->constrained('newsletter_templates')->onDelete('set null');
            
            // Weekly newsletter
            $table->boolean('weekly_enabled')->default(true);
            $table->integer('weekly_send_day')->default(0)->comment('0=Sunday, 6=Saturday');
            $table->time('weekly_send_time')->default('08:00:00');
            $table->foreignId('weekly_template_id')->nullable()->constrained('newsletter_templates')->onDelete('set null');
            
            // Timezone
            $table->string('timezone', 50)->default('America/New_York');
            
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('newsletter_schedules');
    }
};



