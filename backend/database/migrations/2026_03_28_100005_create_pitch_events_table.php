<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pitch_events', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('session_id');
            $table->unsignedBigInteger('smb_id')->nullable();
            $table->unsignedBigInteger('community_id');
            $table->string('event_type');
            $table->string('step')->nullable();
            $table->string('gate')->nullable();
            $table->string('product')->nullable();
            if (DB::getDriverName() === 'pgsql') {
                $table->jsonb('payload')->nullable();
            } else {
                $table->json('payload')->nullable();
            }
            $table->timestampTz('occurred_at');

            $table->index(['session_id', 'occurred_at']);
            $table->index(['event_type', 'occurred_at']);
            $table->index(['gate', 'event_type']);

            $table->foreign('session_id')->references('id')->on('pitch_sessions')->cascadeOnDelete();
            $table->foreign('smb_id')->references('id')->on('smbs')->nullOnDelete();
            $table->foreign('community_id')->references('id')->on('communities')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pitch_events');
    }
};
