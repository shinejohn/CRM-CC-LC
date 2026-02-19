<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('ai_tasks')) {
            return;
        }
        Schema::create('ai_tasks', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('smb_id')->constrained('customers');

            $table->string('task_type', 100);
            $table->string('status', 50)->default('pending');

            if (DB::getDriverName() === 'pgsql') {
                $table->jsonb('input_data')->default(DB::raw("'{}'::jsonb"));
                $table->jsonb('output_data')->default(DB::raw("'{}'::jsonb"));
            } else {
                $table->json('input_data')->default('{}');
                $table->json('output_data')->default('{}');
            }

            $table->timestamp('suggested_at');
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('executed_at')->nullable();
            $table->timestamp('completed_at')->nullable();

            $table->timestamps();

            $table->index('smb_id');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ai_tasks');
    }
};



