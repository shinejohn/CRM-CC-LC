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
        Schema::dropIfExists('alerts');
        Schema::create('alerts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('uuid')->unique(); // Redundant if id is uuid, but model fillable has both
            
            // Content
            $table->string('headline', 255);
            $table->text('summary')->nullable();
            $table->longText('full_content')->nullable();
            
            // Classification
            $table->string('category', 50);
            $table->foreign('category')->references('slug')->on('alert_categories');
            $table->string('severity', 20)->default('standard');
            
            // Source
            $table->string('source_url', 500)->nullable();
            $table->string('source_name', 255)->nullable();
            $table->string('image_url', 500)->nullable();
            
            // Targeting
            $table->string('target_type', 50)->default('all'); // all, community, geo
            if (DB::getDriverName() === 'pgsql') {
                $table->jsonb('target_community_ids')->nullable();
                $table->jsonb('target_geo_json')->nullable();
            } else {
                $table->json('target_community_ids')->nullable();
                $table->json('target_geo_json')->nullable();
            }
            $table->integer('target_radius_miles')->nullable();
            
            // Channels
            $table->boolean('send_email')->default(true);
            $table->boolean('send_sms')->default(false);
            $table->boolean('send_push')->default(false);
            
            // Relationships
            $table->foreignId('sponsor_id')->nullable()->constrained('sponsors')->onDelete('set null');
            $table->foreignId('sponsorship_id')->nullable()->constrained('sponsorships')->onDelete('set null');
            
            // Status & Approval
            $table->string('status', 20)->default('draft');
            $table->foreignId('created_by')->nullable()->constrained('users');
            $table->foreignId('approved_by')->nullable()->constrained('users');
            $table->timestamp('approved_at')->nullable();
            
            // Scheduling
            $table->timestamp('scheduled_for')->nullable();
            $table->timestamp('sending_started_at')->nullable();
            $table->timestamp('sending_completed_at')->nullable();
            
            // Stats
            $table->integer('total_recipients')->default(0);
            $table->integer('email_sent')->default(0);
            $table->integer('email_delivered')->default(0);
            $table->integer('email_opened')->default(0);
            $table->integer('sms_sent')->default(0);
            $table->integer('sms_delivered')->default(0);
            $table->integer('push_sent')->default(0);
            $table->integer('push_delivered')->default(0);
            $table->integer('total_clicks')->default(0);
            
            $table->timestamps();
            
            $table->index('status');
            $table->index('category');
            $table->index('scheduled_for');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('alerts');
    }
};
