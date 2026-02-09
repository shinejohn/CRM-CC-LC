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
        // AI Personalities
        Schema::create('ai_personalities', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id');
            
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            
            // Personality Configuration
            $table->string('identity'); // Name/identity (e.g., "Sarah", "Marketing Expert")
            $table->text('persona_description'); // Detailed persona description
            $table->text('communication_style'); // How they communicate
            $table->json('traits')->nullable(); // Personality traits (array)
            $table->json('expertise_areas')->nullable(); // Areas of expertise
            
            // Contact Capabilities
            $table->boolean('can_email')->default(true);
            $table->boolean('can_call')->default(false);
            $table->boolean('can_sms')->default(false);
            $table->boolean('can_chat')->default(true);
            $table->string('contact_email')->nullable(); // Personality-specific email
            $table->string('contact_phone')->nullable(); // Personality-specific phone
            
            // AI Configuration
            $table->text('system_prompt'); // System prompt for AI
            $table->text('greeting_message')->nullable(); // Default greeting
            $table->json('custom_instructions')->nullable(); // Custom AI instructions
            $table->string('ai_model')->default('anthropic/claude-3.5-sonnet'); // AI model to use
            $table->decimal('temperature', 3, 2)->default(0.7); // AI temperature
            
            // Activity Settings
            $table->json('active_hours')->nullable(); // When personality is active
            $table->json('working_days')->nullable(); // Days of week active
            $table->string('timezone')->default('UTC');
            
            // Status
            $table->boolean('is_active')->default(true);
            $table->integer('priority')->default(0); // Higher priority personalities used first
            
            // Metadata
            $table->json('metadata')->nullable();
            $table->text('notes')->nullable();
            
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();
            
            $table->index('tenant_id');
            $table->index('slug');
            $table->index('is_active');
            $table->index('priority');
        });

        // Personality Assignments (which personality handles which customer)
        Schema::create('personality_assignments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('personality_id');
            $table->uuid('customer_id');
            $table->uuid('tenant_id');
            
            // Assignment Configuration
            $table->enum('status', ['active', 'inactive', 'archived'])->default('active');
            $table->timestamp('assigned_at')->useCurrent();
            $table->timestamp('last_interaction_at')->nullable();
            
            // Assignment Rules
            $table->json('assignment_rules')->nullable(); // Why this personality was assigned
            $table->json('context')->nullable(); // Additional context for this assignment
            
            // Performance Metrics
            $table->integer('interaction_count')->default(0);
            $table->integer('conversation_count')->default(0);
            $table->decimal('average_rating', 3, 2)->nullable(); // Customer satisfaction
            $table->json('performance_metrics')->nullable(); // Additional metrics
            
            $table->text('notes')->nullable();
            
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();
            
            $table->foreign('personality_id')
                  ->references('id')
                  ->on('ai_personalities')
                  ->onDelete('cascade');
            
            $table->foreign('customer_id')
                  ->references('id')
                  ->on('customers')
                  ->onDelete('cascade');
            
            $table->index('personality_id');
            $table->index('customer_id');
            $table->index('tenant_id');
            $table->index('status');
            $table->unique(['personality_id', 'customer_id']); // One personality per customer
        });

        // Personality Conversation History
        Schema::create('personality_conversations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('personality_id');
            $table->uuid('conversation_id'); // Links to existing conversations table
            $table->uuid('tenant_id');
            
            // Personality-specific data
            $table->json('personality_context')->nullable(); // Context used in this conversation
            $table->json('personality_metadata')->nullable(); // Additional metadata
            $table->integer('messages_handled')->default(0);
            
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();
            
            $table->foreign('personality_id')
                  ->references('id')
                  ->on('ai_personalities')
                  ->onDelete('cascade');
            
            $table->foreign('conversation_id')
                  ->references('id')
                  ->on('conversations')
                  ->onDelete('cascade');
            
            $table->index('personality_id');
            $table->index('conversation_id');
            $table->index('tenant_id');
        });

        // Add personality_id to conversations table (if it doesn't exist)
        if (!Schema::hasColumn('conversations', 'personality_id')) {
            Schema::table('conversations', function (Blueprint $table) {
                $table->uuid('personality_id')->nullable()->after('customer_id');
                $table->foreign('personality_id')
                      ->references('id')
                      ->on('ai_personalities')
                      ->onDelete('set null');
                $table->index('personality_id');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('personality_conversations');
        Schema::dropIfExists('personality_assignments');
        Schema::dropIfExists('ai_personalities');
        
        if (Schema::hasColumn('conversations', 'personality_id')) {
            Schema::table('conversations', function (Blueprint $table) {
                $table->dropForeign(['personality_id']);
                $table->dropIndex(['personality_id']);
                $table->dropColumn('personality_id');
            });
        }
    }
};
