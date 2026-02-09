<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        error_log("LOG: RUNNING UP ON SUBSCRIBERS");
        Schema::dropIfExists('subscribers');
        Schema::create('subscribers', function (Blueprint $table) {
            $table->id();
            
            // Generate UUID if using PostgreSQL (requires pgcrypto or gen_random_uuid support)
            if (DB::getDriverName() === 'pgsql') {
                $table->uuid('uuid')->unique()->default(DB::raw('gen_random_uuid()'));
            } else {
                $table->uuid('uuid')->unique();
            }

            // Identity
            $table->string('email', 255)->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('phone', 50)->nullable();
            $table->timestamp('phone_verified_at')->nullable();

            // Profile
            $table->string('first_name', 100)->nullable();
            $table->string('last_name', 100)->nullable();
            $table->string('zip_code', 20)->nullable();

            // Location (Check for PostGIS availability)
            $hasPostGis = false;
            if (DB::getDriverName() === 'pgsql') {
                try {
                    $hasPostGis = !empty(DB::select("SELECT 1 FROM pg_type WHERE typname = 'geography'"));
                } catch (\Exception $e) {
                    $hasPostGis = false;
                }
            }

            if ($hasPostGis) {
                $table->geography('location')->nullable();
            } else {
                $table->decimal('latitude', 10, 8)->nullable();
                $table->decimal('longitude', 11, 8)->nullable();
            }
            $table->string('location_source', 20)->nullable(); // ip, manual, gps

            // Channel opt-ins
            $table->boolean('email_opted_in')->default(true);
            $table->timestamp('email_opted_in_at')->nullable();
            $table->boolean('sms_opted_in')->default(false);
            $table->timestamp('sms_opted_in_at')->nullable();
            $table->boolean('push_opted_in')->default(false);

            // Newsletter preferences
            $table->string('newsletter_frequency', 20)->default('daily'); // daily, weekly, none

            // Alert preferences (default all on)
            $table->boolean('alerts_enabled')->default(true);

            // Push notification tokens (array for multiple devices)
            if (DB::getDriverName() === 'pgsql') {
                $table->jsonb('device_tokens')->default(DB::raw("'[]'::jsonb"));
            } else {
                $table->json('device_tokens')->default('[]');
            }

            // Engagement tracking
            $table->timestamp('last_email_sent_at')->nullable();
            $table->timestamp('last_email_opened_at')->nullable();
            $table->timestamp('last_email_clicked_at')->nullable();
            $table->timestamp('last_login_at')->nullable();

            // Engagement score (0-100, calculated)
            $table->integer('engagement_score')->default(50);
            $table->timestamp('engagement_calculated_at')->nullable();

            // Status
            $table->string('status', 20)->default('active'); // pending, active, unsubscribed, bounced, complained
            $table->timestamp('unsubscribed_at')->nullable();
            $table->string('unsubscribe_reason', 255)->nullable();

            // Authentication
            $table->string('password_hash', 255)->nullable();
            $table->string('remember_token', 100)->nullable();

            // Source tracking
            $table->string('source', 50)->nullable(); // website, app, import, api
            $table->string('source_detail', 255)->nullable(); // Campaign ID, referrer, etc.

            $table->timestamps();

            // Indexes
            $table->index('email');
            $table->index('phone');
            $table->index('status');
            
            if ($hasPostGis) {
                $table->index(DB::raw('location'), null, null, 'gist');
            }
            $table->index(['engagement_score', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subscribers');
    }
};
