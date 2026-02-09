<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('email_delivery_events', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('campaign_recipient_id')->nullable();
            $table->string('external_id')->nullable();
            $table->string('event_type');
            $table->string('provider')->nullable();
            $table->json('payload')->nullable();
            $table->timestamp('received_at')->useCurrent();
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();

            $table->index('campaign_recipient_id');
            $table->index('external_id');
            $table->index('event_type');
            $table->index('provider');

            $table->foreign('campaign_recipient_id')
                ->references('id')
                ->on('campaign_recipients')
                ->onDelete('set null');
        });

        Schema::create('email_suppressions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('email')->unique();
            $table->string('reason');
            $table->string('provider')->nullable();
            $table->string('source')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();

            $table->index('email');
            $table->index('reason');
            $table->index('provider');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('email_suppressions');
        Schema::dropIfExists('email_delivery_events');
    }
};



