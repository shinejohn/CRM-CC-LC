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
        Schema::create('email_messages', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('email_client_id')->constrained('email_clients')->cascadeOnDelete();
            $table->foreignUuid('email_sender_id')->constrained('email_senders')->cascadeOnDelete();
            $table->foreignUuid('email_pool_id')->constrained('email_pools')->cascadeOnDelete();
            $table->string('to_address')->index();
            $table->string('subject');
            $table->string('email_class')->index();
            $table->string('status')->index(); // pending, sent, delivered, bounced, complained, failed, suppressed
            $table->string('provider_message_id')->nullable()->index();
            $table->text('error_message')->nullable();
            $table->json('payload_log');
            $table->timestamp('delivered_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('email_messages');
    }
};
