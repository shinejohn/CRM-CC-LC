<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('content')) {
            return;
        }
        Schema::create('content', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('type', 50);
            $table->string('title');
            $table->string('campaign_id', 50)->nullable();

            if (DB::getDriverName() === 'pgsql') {
                $table->jsonb('slides')->default(DB::raw("'[]'::jsonb"));
            } else {
                $table->json('slides')->default('[]');
            }
            $table->text('article_body')->nullable();
            $table->string('audio_base_url')->nullable();

            $table->integer('duration_seconds')->default(60);
            $table->string('service_type', 100)->nullable();
            $table->string('approval_button_text')->nullable();

            if (DB::getDriverName() === 'pgsql') {
                $table->jsonb('personalization_fields')->default(DB::raw("'[]'::jsonb"));
                $table->jsonb('metadata')->default(DB::raw("'{}'::jsonb"));
            } else {
                $table->json('personalization_fields')->default('[]');
                $table->json('metadata')->default('{}');
            }

            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->foreign('campaign_id')->references('id')->on('campaigns');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('content');
    }
};



