<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('campaign_landing_pages', function (Blueprint $table) {
            $table->string('campaign_id', 50)->primary();
            $table->string('landing_page_slug')->unique();
            $table->string('url')->nullable();
            $table->string('template_id')->nullable();
            $table->string('template_name')->nullable();
            $table->integer('slide_count')->default(0);
            $table->integer('duration_seconds')->default(0);
            $table->string('primary_cta')->nullable();
            $table->string('secondary_cta')->nullable();
            $table->string('ai_persona')->nullable();
            $table->string('ai_tone')->nullable();
            $table->string('ai_goal')->nullable();
            $table->string('audio_base_url')->nullable();
            $table->boolean('crm_tracking')->default(false);
            $table->string('conversion_goal')->nullable();
            $table->string('utm_source')->nullable();
            $table->string('utm_medium')->nullable();
            $table->string('utm_campaign')->nullable();
            $table->string('utm_content')->nullable();

            if (DB::getDriverName() === 'pgsql') {
                $table->jsonb('data_capture_fields')->default(DB::raw("'[]'::jsonb"));
                $table->jsonb('metadata')->default(DB::raw("'{}'::jsonb"));
            } else {
                $table->json('data_capture_fields')->default('[]');
                $table->json('metadata')->default('{}');
            }

            $table->timestamps();

            $table->foreign('campaign_id')
                ->references('id')
                ->on('campaigns')
                ->onDelete('cascade');

            $table->index('template_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('campaign_landing_pages');
    }
};

