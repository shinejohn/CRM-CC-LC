<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Campaign Timeline definitions
        Schema::create('campaign_timelines', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('pipeline_stage'); // Which stage this timeline applies to
            $table->integer('duration_days')->default(90);
            $table->boolean('is_active')->default(true);
            $table->json('metadata')->nullable();
            $table->timestamps();
            
            $table->index('pipeline_stage');
            $table->index('is_active');
        });
        
        // Individual actions within a timeline
        Schema::create('campaign_timeline_actions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('campaign_timeline_id')->constrained()->onDelete('cascade');
            $table->integer('day_number'); // Day 1, 2, 3, etc.
            $table->string('channel'); // email, sms, phone, wait
            $table->string('action_type'); // send_email, send_sms, make_call, check_condition
            $table->string('template_type')->nullable(); // Reference to email/sms template
            $table->string('campaign_id', 50)->nullable(); // Link to campaign content (string ID)
            $table->json('conditions')->nullable(); // e.g., {"if": "email_opened", "then": "skip"}
            $table->json('parameters')->nullable(); // Additional action parameters
            $table->integer('delay_hours')->default(0); // Hours after day starts
            $table->integer('priority')->default(0); // Order within same day
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            $table->foreign('campaign_id')->references('id')->on('campaigns')->onDelete('set null');
            $table->index(['campaign_timeline_id', 'day_number']);
            $table->index('channel');
        });
        
        // Track customer progress through timelines
        Schema::create('customer_timeline_progress', function (Blueprint $table) {
            $table->id();
            $table->uuid('customer_id');
            $table->foreignId('campaign_timeline_id')->constrained()->onDelete('cascade');
            $table->integer('current_day')->default(1);
            $table->timestamp('started_at');
            $table->timestamp('last_action_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamp('paused_at')->nullable();
            $table->string('status')->default('active'); // active, paused, completed, stopped
            $table->json('completed_actions')->nullable(); // Array of completed action IDs
            $table->json('skipped_actions')->nullable(); // Array of skipped action IDs
            $table->json('metadata')->nullable();
            $table->timestamps();
            
            $table->foreign('customer_id')->references('id')->on('customers')->onDelete('cascade');
            $table->unique(['customer_id', 'campaign_timeline_id']);
            $table->index('status');
            $table->index('current_day');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('customer_timeline_progress');
        Schema::dropIfExists('campaign_timeline_actions');
        Schema::dropIfExists('campaign_timelines');
    }
};

