<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('campaign_emails', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('campaign_id', 50);
            $table->string('template_key', 100);
            $table->string('subject');
            $table->text('preview_text')->nullable();
            $table->longText('body_html');
            $table->longText('body_text')->nullable();
            $table->boolean('is_active')->default(true);

            if (DB::getDriverName() === 'pgsql') {
                $table->jsonb('variables')->default(DB::raw("'[]'::jsonb"));
            } else {
                $table->json('variables')->default('[]');
            }

            $table->timestamps();

            $table->foreign('campaign_id')
                ->references('id')
                ->on('campaigns')
                ->onDelete('cascade');

            $table->unique(['campaign_id', 'template_key']);
            $table->index('campaign_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('campaign_emails');
    }
};

