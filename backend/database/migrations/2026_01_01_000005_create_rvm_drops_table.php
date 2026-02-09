<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rvm_drops', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignUuid('smb_id')->constrained('customers');
            $table->foreignId('campaign_send_id')->nullable()->constrained();

            $table->string('phone', 50);
            $table->text('script')->nullable();
            $table->string('voice_persona', 50)->default('sarah');

            $table->timestamp('scheduled_for')->nullable();
            $table->timestamp('sent_at')->nullable();

            $table->string('provider', 50)->default('drop_cowboy');
            $table->string('provider_message_id')->nullable();
            $table->string('status', 50)->default('queued');

            $table->timestamp('delivered_at')->nullable();
            $table->string('delivery_status', 50)->nullable();

            $table->boolean('callback_received')->default(false);
            $table->timestamp('callback_at')->nullable();
            $table->foreignId('callback_id')->nullable();

            $table->timestamps();

            $table->index('smb_id');
            $table->index(['status', 'scheduled_for']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rvm_drops');
    }
};



