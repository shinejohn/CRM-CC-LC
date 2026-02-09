<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('content_views', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('smb_id')->nullable();
            $table->string('content_slug');

            $table->timestamp('started_at');
            $table->timestamp('completed_at')->nullable();
            $table->integer('completion_percentage')->default(0);

            $table->string('source_campaign_id', 50)->nullable();
            $table->text('source_url')->nullable();

            $table->integer('time_on_page_seconds')->nullable();
            if (DB::getDriverName() === 'pgsql') {
                $table->jsonb('slides_viewed')->default(DB::raw("'[]'::jsonb"));
            } else {
                $table->json('slides_viewed')->default('[]');
            }

            $table->boolean('approval_clicked')->default(false);
            $table->boolean('downloaded_pdf')->default(false);
            $table->boolean('shared')->default(false);

            $table->timestamps();

            $table->index('smb_id');
            $table->index('content_slug');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('content_views');
    }
};



