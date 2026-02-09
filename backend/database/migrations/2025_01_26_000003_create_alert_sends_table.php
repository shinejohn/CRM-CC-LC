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
        Schema::dropIfExists('alert_sends');
        Schema::create('alert_sends', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('alert_id')->constrained('alerts')->onDelete('cascade');
            $table->foreignId('subscriber_id')->constrained('subscribers')->onDelete('cascade');
            
            // Channels used
            $table->boolean('email_sent')->default(false);
            $table->unsignedBigInteger('email_message_id')->nullable(); // Reference to message_queue (if exists)
            $table->boolean('sms_sent')->default(false);
            $table->unsignedBigInteger('sms_message_id')->nullable();
            $table->boolean('push_sent')->default(false);
            $table->unsignedBigInteger('push_message_id')->nullable();
            
            // Engagement
            $table->timestamp('opened_at')->nullable();
            $table->timestamp('clicked_at')->nullable();
            
            $table->timestamp('created_at')->useCurrent();
            
            // Indexes
            $table->index('alert_id');
            $table->index(['subscriber_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('alert_sends');
    }
};



