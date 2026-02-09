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
        Schema::create('interactions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id');
            $table->uuid('customer_id');
            
            // Interaction details
            $table->string('type', 50); // 'phone_call', 'send_proposal', 'follow_up', 'email', 'sms', 'meeting', 'demo', etc.
            $table->string('title'); // Human-readable title
            $table->text('description')->nullable();
            $table->text('notes')->nullable();
            
            // Scheduling
            $table->timestamp('scheduled_at')->nullable(); // When this should happen
            $table->timestamp('completed_at')->nullable(); // When it was completed
            $table->timestamp('due_at')->nullable(); // Deadline (e.g., "by Wednesday")
            
            // Status
            $table->string('status', 20)->default('pending'); // 'pending', 'in_progress', 'completed', 'cancelled', 'skipped'
            $table->string('priority', 20)->default('normal'); // 'low', 'normal', 'high', 'urgent'
            
            // Next step configuration
            $table->uuid('template_id')->nullable(); // Reference to interaction_template if part of a workflow
            $table->uuid('next_interaction_id')->nullable(); // The next interaction that was auto-created
            $table->uuid('previous_interaction_id')->nullable(); // The interaction that created this one
            
            // Context
            $table->string('entry_point', 50)->nullable(); // 'campaign', 'manual', 'auto', 'workflow'
            $table->uuid('campaign_id')->nullable(); // If created by a campaign
            $table->uuid('conversation_id')->nullable(); // If related to a conversation
            
            // Outcome tracking
            $table->string('outcome', 50)->nullable(); // 'success', 'no_answer', 'not_interested', 'interested', 'scheduled', etc.
            $table->text('outcome_details')->nullable();
            
            // Metadata for flexible data storage
            if (DB::getDriverName() === 'pgsql') {
                $table->jsonb('metadata')->default(DB::raw("'{}'::jsonb"));
            } else {
                $table->json('metadata')->default('{}');
            }
            
            // Timestamps
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();
            
            // Foreign keys
            $table->foreign('customer_id')
                  ->references('id')
                  ->on('customers')
                  ->onDelete('cascade');
            
            // Indexes
            $table->index('tenant_id');
            $table->index('customer_id');
            $table->index('status');
            $table->index('type');
            $table->index('scheduled_at');
            $table->index('due_at');
            $table->index('template_id');
            $table->index('campaign_id');
            $table->index('next_interaction_id');
            $table->index('previous_interaction_id');
        });
        
        // Add self-referential foreign keys after table is created
        Schema::table('interactions', function (Blueprint $table) {
            $table->foreign('next_interaction_id')
                  ->references('id')
                  ->on('interactions')
                  ->onDelete('set null');
            
            $table->foreign('previous_interaction_id')
                  ->references('id')
                  ->on('interactions')
                  ->onDelete('set null');
        });
        
        // Create interaction_templates table for defining workflows
        Schema::create('interaction_templates', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id');
            
            $table->string('name'); // Template name (e.g., "Standard Follow-up Sequence")
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            
            // Template configuration
            if (DB::getDriverName() === 'pgsql') {
                $table->jsonb('steps')->default(DB::raw("'[]'::jsonb")); // Array of interaction definitions
            } else {
                $table->json('steps')->default('[]');
            }
            
            // Steps format:
            // [
            //   {
            //     "step_number": 1,
            //     "type": "phone_call",
            //     "title": "Initial Call",
            //     "description": "Make initial contact call",
            //     "scheduled_offset_days": 0, // Days from previous step completion
            //     "due_offset_days": 0, // Days from scheduled_at for due_at
            //     "next_step": 2
            //   },
            //   {
            //     "step_number": 2,
            //     "type": "send_proposal",
            //     "title": "Send Proposal",
            //     "description": "Send proposal by Wednesday",
            //     "scheduled_offset_days": 0, // Same day as call completion
            //     "due_offset_days": 2, // Due 2 days after call (Wednesday)
            //     "next_step": 3
            //   }
            // ]
            
            $table->boolean('is_active')->default(true);
            $table->boolean('is_default')->default(false); // Default template for new customers
            
            $table->timestamps();
            
            $table->index('tenant_id');
            $table->index('slug');
            $table->index('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('interactions');
        Schema::dropIfExists('interaction_templates');
    }
};

