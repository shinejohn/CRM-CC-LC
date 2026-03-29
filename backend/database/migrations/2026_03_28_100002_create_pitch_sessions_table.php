<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pitch_sessions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->unsignedBigInteger('smb_id')->nullable();
            $table->uuid('customer_id')->nullable();
            $table->unsignedBigInteger('community_id');
            $table->uuid('conversation_id')->nullable();
            $table->string('entry_platform');
            $table->string('entry_context')->nullable();
            $table->string('org_type')->nullable();
            $table->string('pitch_track')->nullable();
            $table->string('status');
            $table->string('last_step');
            if (DB::getDriverName() === 'pgsql') {
                $table->jsonb('discovery_answers')->nullable();
                $table->jsonb('territory_selection')->nullable();
                $table->jsonb('gates_offered')->nullable();
                $table->jsonb('gates_completed')->nullable();
                $table->jsonb('gates_deferred')->nullable();
                $table->jsonb('products_accepted')->nullable();
                $table->jsonb('products_declined')->nullable();
                $table->jsonb('products_deferred')->nullable();
            } else {
                $table->json('discovery_answers')->nullable();
                $table->json('territory_selection')->nullable();
                $table->json('gates_offered')->nullable();
                $table->json('gates_completed')->nullable();
                $table->json('gates_deferred')->nullable();
                $table->json('products_accepted')->nullable();
                $table->json('products_declined')->nullable();
                $table->json('products_deferred')->nullable();
            }
            $table->string('proposal_id', 50)->nullable();
            $table->decimal('proposal_value', 10, 2)->nullable();
            $table->timestampTz('last_active_at')->nullable();
            $table->timestampTz('resume_reminded_at')->nullable();
            $table->timestampTz('abandoned_at')->nullable();
            $table->timestamps();

            $table->index(['smb_id', 'status']);
            $table->index(['community_id', 'status']);
            $table->index('last_active_at');

            $table->foreign('smb_id')->references('id')->on('smbs')->nullOnDelete();
            $table->foreign('customer_id')->references('id')->on('customers')->nullOnDelete();
            $table->foreign('community_id')->references('id')->on('communities')->cascadeOnDelete();
            $table->foreign('conversation_id')->references('id')->on('conversations')->nullOnDelete();
            $table->foreign('proposal_id')->references('id')->on('campaigns')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pitch_sessions');
    }
};
