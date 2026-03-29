<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pitch_reengagement_queue', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('session_id');
            $table->unsignedBigInteger('smb_id')->nullable();
            $table->uuid('customer_id')->nullable();
            $table->string('contact_email');
            $table->string('reengagement_type');
            if (DB::getDriverName() === 'pgsql') {
                $table->jsonb('context')->nullable();
                $table->jsonb('deferred_gates')->nullable();
                $table->jsonb('deferred_products')->nullable();
            } else {
                $table->json('context')->nullable();
                $table->json('deferred_gates')->nullable();
                $table->json('deferred_products')->nullable();
            }
            $table->timestampTz('send_after');
            $table->string('status')->default('queued');
            $table->uuid('outbound_campaign_id')->nullable();
            $table->timestampTz('sent_at')->nullable();
            $table->timestampTz('opened_at')->nullable();
            $table->timestampTz('clicked_at')->nullable();
            $table->timestamps();

            $table->index(['status', 'send_after']);
            $table->index('smb_id');

            $table->foreign('session_id')->references('id')->on('pitch_sessions')->cascadeOnDelete();
            $table->foreign('smb_id')->references('id')->on('smbs')->nullOnDelete();
            $table->foreign('customer_id')->references('id')->on('customers')->nullOnDelete();
            $table->foreign('outbound_campaign_id')->references('id')->on('outbound_campaigns')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pitch_reengagement_queue');
    }
};
