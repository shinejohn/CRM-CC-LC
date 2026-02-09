<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('objection_handlers', function (Blueprint $table) {
            $table->id();
            $table->string('objection_type'); // price, time, not_interested, need_to_think, competitor, etc.
            $table->string('trigger_phrase'); // What customer says
            $table->json('trigger_keywords')->nullable(); // Keywords to match
            $table->text('response'); // What AM should say
            $table->text('follow_up')->nullable(); // Follow-up question/statement
            $table->string('next_action')->nullable(); // schedule_callback, send_info, escalate, accept_no
            $table->json('next_action_params')->nullable();
            $table->integer('priority')->default(0); // Higher = check first
            $table->boolean('is_active')->default(true);
            $table->json('industry_specific')->nullable(); // Only for certain industries
            $table->integer('success_rate')->default(0); // Tracking effectiveness
            $table->integer('usage_count')->default(0);
            $table->timestamps();
            
            $table->index('objection_type');
            $table->index('is_active');
        });
        
        // Track objection handling outcomes
        Schema::create('objection_encounters', function (Blueprint $table) {
            $table->id();
            $table->uuid('customer_id');
            $table->foreignId('objection_handler_id')->constrained()->onDelete('cascade');
            $table->string('channel'); // phone, email, sms, chat
            $table->text('customer_statement'); // What they actually said
            $table->text('am_response'); // What AM responded
            $table->string('outcome'); // overcame, accepted_no, escalated, callback_scheduled
            $table->json('metadata')->nullable();
            $table->timestamps();
            
            $table->foreign('customer_id')->references('id')->on('customers')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('objection_encounters');
        Schema::dropIfExists('objection_handlers');
    }
};

