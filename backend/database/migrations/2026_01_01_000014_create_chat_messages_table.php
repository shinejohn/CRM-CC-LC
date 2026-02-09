<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('chat_messages', function (Blueprint $table) {
            $table->id();
            $table->uuid('session_id');
            $table->foreignId('smb_id')->nullable()->constrained();

            $table->string('role', 20);
            $table->text('content');

            $table->string('intent', 100)->nullable();
            if (DB::getDriverName() === 'pgsql') {
                $table->jsonb('actions_taken')->default(DB::raw("'[]'::jsonb"));
            } else {
                $table->json('actions_taken')->default('[]');
            }

            $table->timestamps();

            $table->index('session_id');
            $table->index('smb_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('chat_messages');
    }
};



