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
        Schema::create('conversations', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('uuid_generate_v4()'));
            $table->uuid('tenant_id');
            $table->uuid('customer_id')->nullable();
            
            $table->string('session_id', 100);
            
            // Context
            $table->string('entry_point', 100)->nullable(); // 'presentation', 'chat_widget', 'phone', 'sms'
            $table->string('template_id', 50)->nullable();
            $table->integer('slide_at_start')->nullable();
            
            // Participants
            $table->string('presenter_id', 50)->nullable(); // References presenters table
            $table->string('human_rep_id', 100)->nullable();
            
            // Full conversation log
            $table->jsonb('messages')->default('[]');
            
            // AI analysis
            $table->json('topics_discussed')->nullable(); // Array
            $table->jsonb('questions_asked')->nullable();
            $table->jsonb('objections_raised')->nullable();
            $table->jsonb('sentiment_trajectory')->nullable();
            
            // Data collected
            $table->jsonb('new_data_collected')->nullable();
            $table->json('faqs_generated')->nullable(); // Array of UUIDs
            
            // Outcome
            $table->string('outcome', 50)->nullable(); // 'signup', 'demo_scheduled', 'pricing_sent', etc.
            $table->text('outcome_details')->nullable();
            
            // Follow-up
            $table->boolean('followup_needed')->default(false);
            $table->timestampTz('followup_scheduled_at')->nullable();
            $table->text('followup_notes')->nullable();
            
            // Duration
            $table->timestampTz('started_at')->default(DB::raw('NOW()'));
            $table->timestampTz('ended_at')->nullable();
            $table->integer('duration_seconds')->nullable();
            
            // Metadata
            $table->text('user_agent')->nullable();
            $table->string('ip_address')->nullable();
            
            $table->timestampTz('created_at')->default(DB::raw('NOW()'));
            $table->timestampTz('updated_at')->default(DB::raw('NOW()'));
            
            // Foreign key
            $table->foreign('customer_id')
                  ->references('id')
                  ->on('customers')
                  ->onDelete('set null');
            
            // Indexes
            $table->index('tenant_id');
            $table->index('customer_id');
            $table->index('session_id');
            $table->index('started_at');
            $table->index('outcome');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('conversations');
    }
};
