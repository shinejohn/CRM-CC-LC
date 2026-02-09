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
        Schema::create('community_email_lists', function (Blueprint $table) {
            $table->foreignUuid('community_id')->primary()->constrained('communities');
            
            // Pre-compiled email arrays (rebuilt nightly or on significant changes)
            if (DB::getDriverName() === 'pgsql') {
                $table->text('daily_newsletter_emails')->nullable(); // Stored as comma-separated or JSON
                $table->text('weekly_newsletter_emails')->nullable();
                $table->text('alert_emails')->nullable();
                $table->text('emergency_emails')->nullable();
            } else {
                $table->json('daily_newsletter_emails')->nullable();
                $table->json('weekly_newsletter_emails')->nullable();
                $table->json('alert_emails')->nullable();
                $table->json('emergency_emails')->nullable();
            }
            
            // Counts
            $table->integer('daily_count')->default(0);
            $table->integer('weekly_count')->default(0);
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
        Schema::dropIfExists('community_email_lists');
    }
};



