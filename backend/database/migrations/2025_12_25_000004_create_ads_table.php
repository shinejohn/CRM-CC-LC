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
        // Ad templates
        Schema::create('ad_templates', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('uuid_generate_v4()'));
            $table->uuid('tenant_id');
            
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('platform'); // 'facebook', 'google', 'instagram', 'linkedin', 'twitter', 'display'
            $table->string('ad_type'); // 'image', 'video', 'carousel', 'text', 'story'
            $table->text('description')->nullable();
            $table->json('structure')->nullable(); // Ad structure (headline, description, CTA, etc.)
            $table->text('prompt_template')->nullable(); // AI prompt template
            $table->json('variables')->nullable(); // Available template variables
            $table->json('specs')->nullable(); // Platform-specific specs (dimensions, file sizes, etc.)
            $table->boolean('is_active')->default(true);
            
            $table->timestampTz('created_at')->default(DB::raw('NOW()'));
            $table->timestampTz('updated_at')->default(DB::raw('NOW()'));
            
            $table->index('tenant_id');
            $table->index('platform');
            $table->index('ad_type');
            $table->index('slug');
        });

        // Generated ads
        Schema::create('generated_ads', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('uuid_generate_v4()'));
            $table->uuid('tenant_id');
            
            $table->string('name');
            $table->string('platform'); // 'facebook', 'google', 'instagram', 'linkedin', 'twitter', 'display'
            $table->string('ad_type'); // 'image', 'video', 'carousel', 'text', 'story'
            $table->enum('status', ['draft', 'review', 'approved', 'scheduled', 'active', 'paused', 'archived'])->default('draft');
            
            // Ad content
            $table->string('headline')->nullable();
            $table->text('description')->nullable();
            $table->string('call_to_action')->nullable();
            $table->string('destination_url')->nullable();
            $table->json('media_urls')->nullable(); // Image/video URLs
            $table->json('content')->nullable(); // Structured content (JSON)
            $table->json('metadata')->nullable(); // Additional metadata
            
            // Generation source
            $table->uuid('campaign_id')->nullable(); // Source campaign
            $table->uuid('content_id')->nullable(); // Related content
            $table->uuid('template_id')->nullable(); // Used template
            $table->json('generation_params')->nullable(); // Parameters used for generation
            
            // Targeting
            $table->json('targeting')->nullable(); // Audience targeting
            $table->json('budget')->nullable(); // Budget settings
            $table->json('schedule')->nullable(); // Scheduling info
            
            // Scheduling
            $table->timestampTz('scheduled_start_at')->nullable();
            $table->timestampTz('scheduled_end_at')->nullable();
            $table->timestampTz('started_at')->nullable();
            $table->timestampTz('ended_at')->nullable();
            
            // External IDs
            $table->string('external_ad_id')->nullable(); // Platform-specific ad ID
            $table->string('external_campaign_id')->nullable(); // Platform-specific campaign ID
            
            // Analytics
            $table->integer('impressions')->default(0);
            $table->integer('clicks')->default(0);
            $table->decimal('spend', 10, 2)->default(0);
            $table->decimal('conversions', 10, 2)->default(0);
            $table->json('analytics_data')->nullable(); // Additional analytics
            
            $table->text('notes')->nullable();
            
            $table->timestampTz('created_at')->default(DB::raw('NOW()'));
            $table->timestampTz('updated_at')->default(DB::raw('NOW()'));
            
            $table->index('tenant_id');
            $table->index('platform');
            $table->index('status');
            $table->index('campaign_id');
            $table->index('content_id');
            $table->index('template_id');
            $table->index('scheduled_start_at');
            $table->index('external_ad_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('generated_ads');
        Schema::dropIfExists('ad_templates');
    }
};
