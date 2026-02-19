<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('callbacks')) {
            return;
        }
        Schema::create('callbacks', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->unsignedBigInteger('smb_id')->nullable();
            $table->foreignId('rvm_drop_id')->nullable()->constrained();

            $table->string('caller_phone', 50);
            $table->string('called_number', 50);
            $table->timestamp('started_at');
            $table->timestamp('ended_at')->nullable();
            $table->integer('duration_seconds')->nullable();

            $table->text('transcript')->nullable();
            $table->text('summary')->nullable();

            $table->string('intent_detected', 100)->nullable();
            if (DB::getDriverName() === 'pgsql') {
                $table->jsonb('actions_taken')->default(DB::raw("'[]'::jsonb"));
            } else {
                $table->json('actions_taken')->default('[]');
            }

            $table->boolean('followup_email_sent')->default(false);
            $table->timestamp('followup_email_sent_at')->nullable();

            if (DB::getDriverName() === 'pgsql') {
                $table->jsonb('metadata')->default(DB::raw("'{}'::jsonb"));
            } else {
                $table->json('metadata')->default('{}');
            }
            $table->timestamps();

            $table->index('smb_id');
            $table->index('caller_phone');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('callbacks');
    }
};



