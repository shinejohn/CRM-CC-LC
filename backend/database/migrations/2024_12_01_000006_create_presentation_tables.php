<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('presentation_templates', function (Blueprint $table) {
            $table->string('id', 50)->primary();
            $table->string('name', 255);
            $table->text('description')->nullable();
            $table->string('purpose', 100)->nullable();
            $table->string('target_audience', 255)->nullable();
            
            // Structure
            $table->jsonb('slides');
            
            // Pre-recorded audio location
            $table->string('audio_base_url', 500)->nullable();
            $table->jsonb('audio_files')->nullable();
            
            // Dynamic injection points
            $table->jsonb('injection_points')->nullable();
            
            // Visual
            $table->jsonb('default_theme')->nullable();
            $table->string('default_presenter_id', 50)->nullable();
            
            // Metadata
            $table->integer('estimated_duration')->nullable();
            $table->integer('slide_count')->nullable();
            
            $table->boolean('is_active')->default(true);
            $table->timestampTz('created_at')->default(DB::raw('NOW()'));
            $table->timestampTz('updated_at')->default(DB::raw('NOW()'));
        });
        
        Schema::create('presenters', function (Blueprint $table) {
            $table->string('id', 50)->primary();
            $table->string('name', 100);
            $table->string('role', 100)->nullable();
            $table->string('avatar_url', 500)->nullable();
            
            // Voice settings
            $table->string('voice_provider', 50)->nullable();
            $table->string('voice_id', 100)->nullable();
            $table->jsonb('voice_settings')->nullable();
            
            // AI personality
            $table->text('personality')->nullable();
            $table->text('communication_style')->nullable();
            
            $table->boolean('is_active')->default(true);
            $table->timestampTz('created_at')->default(DB::raw('NOW()'));
        });
        
        Schema::create('generated_presentations', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('uuid_generate_v4()'));
            $table->uuid('tenant_id');
            $table->uuid('customer_id')->nullable();
            $table->string('template_id', 50)->nullable();
            
            // The assembled presentation
            $table->jsonb('presentation_json');
            
            // Audio status
            $table->string('audio_base_url', 500)->nullable();
            $table->boolean('audio_generated')->default(false);
            $table->timestampTz('audio_generated_at')->nullable();
            
            // Cache management
            $table->string('input_hash', 64)->nullable();
            $table->timestampTz('expires_at')->nullable();
            
            // Analytics
            $table->integer('view_count')->default(0);
            $table->decimal('avg_completion_rate', 5, 2)->nullable();
            $table->timestampTz('last_viewed_at')->nullable();
            
            $table->timestampTz('created_at')->default(DB::raw('NOW()'));
            
            $table->foreign('template_id')->references('id')->on('presentation_templates')->onDelete('set null');
            $table->index('tenant_id');
            $table->index('customer_id');
            $table->index('template_id');
            $table->index('input_hash');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('generated_presentations');
        Schema::dropIfExists('presenters');
        Schema::dropIfExists('presentation_templates');
    }
};

