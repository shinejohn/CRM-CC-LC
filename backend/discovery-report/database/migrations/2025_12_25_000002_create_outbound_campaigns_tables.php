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
        // Outbound campaigns table
        Schema::create('outbound_campaigns', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id');
            
            $table->string('name');
            $table->string('type'); // 'email', 'phone', 'sms'
            $table->enum('status', ['draft', 'scheduled', 'running', 'paused', 'completed', 'cancelled'])->default('draft');
            
            // Campaign configuration
            $table->string('subject')->nullable(); // For email
            $table->text('message'); // Message content
            $table->string('template_id')->nullable(); // Template reference
            $table->json('template_variables')->nullable(); // Template variables
            
            // Scheduling
            $table->timestampTz('scheduled_at')->nullable();
            $table->timestampTz('started_at')->nullable();
            $table->timestampTz('completed_at')->nullable();
            
            // Recipients
            $table->json('recipient_segments')->nullable(); // Segmentation criteria
            $table->integer('total_recipients')->default(0);
            $table->integer('sent_count')->default(0);
            $table->integer('delivered_count')->default(0);
            $table->integer('failed_count')->default(0);
            $table->integer('opened_count')->default(0); // Email only
            $table->integer('clicked_count')->default(0); // Email only
            $table->integer('replied_count')->default(0); // Email/SMS
            $table->integer('answered_count')->default(0); // Phone only
            $table->integer('voicemail_count')->default(0); // Phone only
            
            // Campaign metadata
            $table->json('metadata')->nullable();
            $table->text('notes')->nullable();
            
            $table->timestampTz('created_at')->default(DB::raw('NOW()'));
            $table->timestampTz('updated_at')->default(DB::raw('NOW()'));
            
            // Indexes
            $table->index('tenant_id');
            $table->index('type');
            $table->index('status');
            $table->index('scheduled_at');
        });

        // Campaign recipients (individual sends)
        Schema::create('campaign_recipients', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('campaign_id');
            $table->uuid('customer_id')->nullable();
            $table->uuid('tenant_id');
            
            // Recipient contact info
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->string('name')->nullable();
            
            // Status
            $table->enum('status', ['pending', 'queued', 'sent', 'delivered', 'opened', 'clicked', 'replied', 'answered', 'voicemail', 'failed', 'bounced', 'unsubscribed'])->default('pending');
            $table->timestampTz('sent_at')->nullable();
            $table->timestampTz('delivered_at')->nullable();
            $table->timestampTz('opened_at')->nullable(); // Email
            $table->timestampTz('clicked_at')->nullable(); // Email
            $table->timestampTz('replied_at')->nullable(); // Email/SMS
            $table->timestampTz('answered_at')->nullable(); // Phone
            $table->integer('duration_seconds')->nullable(); // Phone
            
            // Tracking
            $table->string('external_id')->nullable(); // Provider message ID
            $table->text('error_message')->nullable();
            $table->json('metadata')->nullable();
            
            $table->timestampTz('created_at')->default(DB::raw('NOW()'));
            $table->timestampTz('updated_at')->default(DB::raw('NOW()'));
            
            // Foreign keys
            $table->foreign('campaign_id')
                  ->references('id')
                  ->on('outbound_campaigns')
                  ->onDelete('cascade');
            
            $table->foreign('customer_id')
                  ->references('id')
                  ->on('customers')
                  ->onDelete('set null');
            
            // Indexes
            $table->index('campaign_id');
            $table->index('customer_id');
            $table->index('tenant_id');
            $table->index('status');
            $table->index('email');
            $table->index('phone');
        });

        // Email templates
        Schema::create('email_templates', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id');
            
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('subject');
            $table->text('html_content');
            $table->text('text_content')->nullable();
            
            $table->json('variables')->nullable(); // Available template variables
            $table->boolean('is_active')->default(true);
            
            $table->timestampTz('created_at')->default(DB::raw('NOW()'));
            $table->timestampTz('updated_at')->default(DB::raw('NOW()'));
            
            // Indexes
            $table->index('tenant_id');
            $table->index('slug');
        });

        // SMS templates
        Schema::create('sms_templates', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id');
            
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('message');
            
            $table->json('variables')->nullable(); // Available template variables
            $table->boolean('is_active')->default(true);
            
            $table->timestampTz('created_at')->default(DB::raw('NOW()'));
            $table->timestampTz('updated_at')->default(DB::raw('NOW()'));
            
            // Indexes
            $table->index('tenant_id');
            $table->index('slug');
        });

        // Phone call scripts
        Schema::create('phone_scripts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id');
            
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('script');
            
            $table->json('variables')->nullable(); // Available template variables
            $table->boolean('is_active')->default(true);
            
            $table->timestampTz('created_at')->default(DB::raw('NOW()'));
            $table->timestampTz('updated_at')->default(DB::raw('NOW()'));
            
            // Indexes
            $table->index('tenant_id');
            $table->index('slug');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('campaign_recipients');
        Schema::dropIfExists('phone_scripts');
        Schema::dropIfExists('sms_templates');
        Schema::dropIfExists('email_templates');
        Schema::dropIfExists('outbound_campaigns');
    }
};
