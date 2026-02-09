<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Dialog tree definitions
        Schema::create('dialog_trees', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('trigger_type'); // initial_call, followup_call, sales_call, support_call
            $table->string('pipeline_stage')->nullable(); // When to use this tree
            $table->boolean('is_active')->default(true);
            $table->json('metadata')->nullable();
            $table->timestamps();
            
            $table->index('trigger_type');
            $table->index('pipeline_stage');
        });
        
        // Individual nodes in dialog tree
        Schema::create('dialog_tree_nodes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('dialog_tree_id')->constrained()->onDelete('cascade');
            $table->string('node_key')->index(); // Unique within tree
            $table->string('node_type'); // say, ask, listen, branch, action, end
            $table->text('content')->nullable(); // What to say
            $table->text('prompt')->nullable(); // What to ask/listen for
            $table->json('expected_responses')->nullable(); // For branching
            $table->json('branches')->nullable(); // Next nodes based on response
            $table->string('default_next')->nullable(); // Default next node
            $table->string('action_type')->nullable(); // schedule_callback, send_email, update_crm, etc.
            $table->json('action_params')->nullable();
            $table->integer('order')->default(0);
            $table->timestamps();
            
            $table->unique(['dialog_tree_id', 'node_key']);
        });
        
        // Track dialog execution per customer
        Schema::create('dialog_executions', function (Blueprint $table) {
            $table->id();
            $table->uuid('customer_id');
            $table->foreignId('dialog_tree_id')->constrained()->onDelete('cascade');
            $table->uuid('ai_personality_id')->nullable();
            $table->string('current_node')->nullable();
            $table->string('status')->default('in_progress'); // in_progress, completed, abandoned, escalated
            $table->json('collected_data')->nullable(); // Data gathered during dialog
            $table->json('path_taken')->nullable(); // Array of node_keys traversed
            $table->string('outcome')->nullable(); // success, objection, callback_scheduled, etc.
            $table->timestamp('started_at');
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
            
            $table->foreign('customer_id')->references('id')->on('customers')->onDelete('cascade');
            $table->foreign('ai_personality_id')->references('id')->on('ai_personalities')->onDelete('set null');
            $table->index(['customer_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('dialog_executions');
        Schema::dropIfExists('dialog_tree_nodes');
        Schema::dropIfExists('dialog_trees');
    }
};

