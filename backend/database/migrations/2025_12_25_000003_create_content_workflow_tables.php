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
        // Content templates
        Schema::create('content_templates', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id');
            
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('type'); // 'article', 'blog', 'social', 'email', 'landing_page'
            $table->text('description')->nullable();
            $table->text('prompt_template'); // AI prompt template with variables
            $table->json('variables')->nullable(); // Available template variables
            $table->json('structure')->nullable(); // Content structure/outline
            $table->boolean('is_active')->default(true);
            
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();
            
            $table->index('tenant_id');
            $table->index('type');
            $table->index('slug');
        });

        // Generated content
        Schema::create('generated_content', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id');
            
            $table->string('title');
            $table->string('slug')->nullable();
            $table->string('type'); // 'article', 'blog', 'social', 'email', 'landing_page'
            $table->enum('status', ['draft', 'review', 'approved', 'published', 'archived'])->default('draft');
            
            // Content
            $table->text('content'); // HTML/markdown content
            $table->text('excerpt')->nullable();
            $table->json('metadata')->nullable(); // SEO, tags, categories, etc.
            
            // Generation source
            $table->uuid('campaign_id')->nullable(); // Source campaign
            $table->uuid('template_id')->nullable(); // Used template
            $table->json('generation_params')->nullable(); // Parameters used for generation
            
            // Workflow
            $table->uuid('assigned_to')->nullable(); // Reviewer/approver
            $table->timestamp('scheduled_publish_at')->nullable();
            $table->timestamp('published_at')->nullable();
            $table->uuid('published_by')->nullable();
            
            // Publishing
            $table->json('published_channels')->nullable(); // Channels where published
            $table->json('publishing_metadata')->nullable(); // Channel-specific metadata
            
            $table->text('notes')->nullable();
            
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();
            
            $table->index('tenant_id');
            $table->index('type');
            $table->index('status');
            $table->index('campaign_id');
            $table->index('template_id');
            $table->index('scheduled_publish_at');
            $table->index('slug');
        });

        // Content versions (versioning system)
        Schema::create('content_versions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('content_id');
            $table->uuid('tenant_id');
            
            $table->integer('version_number');
            $table->string('title');
            $table->text('content');
            $table->text('excerpt')->nullable();
            $table->json('metadata')->nullable();
            
            $table->uuid('created_by')->nullable();
            $table->text('change_notes')->nullable();
            
            $table->timestamp('created_at')->useCurrent();
            
            $table->foreign('content_id')
                  ->references('id')
                  ->on('generated_content')
                  ->onDelete('cascade');
            
            $table->index('content_id');
            $table->index('tenant_id');
            $table->index(['content_id', 'version_number']);
        });

        // Content workflow history
        Schema::create('content_workflow_history', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('content_id');
            $table->uuid('tenant_id');
            
            $table->enum('action', ['created', 'updated', 'status_changed', 'assigned', 'reviewed', 'approved', 'rejected', 'published', 'archived']);
            $table->string('from_status')->nullable();
            $table->string('to_status')->nullable();
            $table->uuid('performed_by')->nullable();
            $table->text('notes')->nullable();
            $table->json('metadata')->nullable();
            
            $table->timestamp('created_at')->useCurrent();
            
            $table->foreign('content_id')
                  ->references('id')
                  ->on('generated_content')
                  ->onDelete('cascade');
            
            $table->index('content_id');
            $table->index('tenant_id');
            $table->index('action');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('content_workflow_history');
        Schema::dropIfExists('content_versions');
        Schema::dropIfExists('generated_content');
        Schema::dropIfExists('content_templates');
    }
};
