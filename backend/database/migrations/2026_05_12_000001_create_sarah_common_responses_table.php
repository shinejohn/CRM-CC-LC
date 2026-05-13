<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sarah_common_responses', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('intent_key', 100)->unique();
            $table->string('category', 50);
            $table->text('response_text');
            $table->jsonb('trigger_phrases');
            $table->string('audio_file')->nullable();
            $table->string('audio_url')->nullable();
            $table->boolean('audio_generated')->default(false);
            $table->boolean('always_ai')->default(false);
            $table->integer('match_count')->default(0);
            $table->integer('priority')->default(100);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sarah_common_responses');
    }
};
