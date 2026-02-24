<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('social_studio_content', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->unsignedBigInteger('smb_id');
            $table->uuid('session_id')->nullable();
            $table->enum('content_type', [
                'post_copy', 'event_card', 'coupon_card',
                'google_post', 'medium_article', 'content_calendar',
                'hashtag_pack', 'competitor_analysis'
            ]);
            $table->text('source_brief')->nullable();
            $table->string('platform')->nullable();
            
            // Using json to support sqlite tests easily instead of jsonb
            $table->json('generated_output')->nullable(); 
            
            $table->integer('credits_consumed')->default(0);
            $table->enum('status', ['draft', 'approved', 'scheduled', 'posted', 'archived'])->default('draft');
            $table->timestamp('scheduled_at')->nullable();
            $table->timestamp('posted_at')->nullable();
            $table->string('platform_post_id')->nullable();
            $table->timestamps();

            $table->foreign('smb_id')->references('id')->on('smbs')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('social_studio_content');
    }
};
