<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('campaign_sends')) {
            return;
        }
        Schema::create('campaign_sends', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignUuid('smb_id')->constrained('customers');
            $table->string('campaign_id', 50);

            $table->string('email');
            $table->string('subject')->nullable();
            $table->timestamp('scheduled_for')->nullable();
            $table->timestamp('sent_at')->nullable();

            $table->string('message_id')->nullable();
            $table->string('status', 50)->default('queued');

            $table->timestamp('delivered_at')->nullable();
            $table->timestamp('opened_at')->nullable();
            $table->timestamp('clicked_at')->nullable();
            $table->timestamp('bounced_at')->nullable();
            $table->timestamp('complained_at')->nullable();

            $table->boolean('rvm_triggered')->default(false);
            $table->foreignId('rvm_drop_id')->nullable();

            $table->timestamps();

            $table->index('smb_id');
            $table->index('campaign_id');
            $table->index('status');
            $table->index(['status', 'scheduled_for']);
            $table->index(['status', 'sent_at', 'opened_at']);

            $table->foreign('campaign_id')->references('id')->on('campaigns');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('campaign_sends');
    }
};



