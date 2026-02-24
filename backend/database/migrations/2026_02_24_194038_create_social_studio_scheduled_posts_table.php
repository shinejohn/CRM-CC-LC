<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('social_studio_scheduled_posts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->unsignedBigInteger('smb_id');
            $table->uuid('content_id');
            $table->uuid('connected_account_id');
            $table->string('platform');
            $table->enum('status', ['pending', 'posted', 'failed', 'cancelled'])->default('pending');
            $table->timestamp('scheduled_at');
            $table->timestamp('posted_at')->nullable();
            $table->string('platform_post_id')->nullable();
            $table->text('error_log')->nullable();
            $table->timestamps();

            $table->foreign('smb_id')->references('id')->on('smbs')->onDelete('cascade');
            // Adding these constraints last ensures the parent tables exist
            $table->foreign('content_id')->references('id')->on('social_studio_content')->onDelete('cascade');
            $table->foreign('connected_account_id')->references('id')->on('social_studio_connected_accounts')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('social_studio_scheduled_posts');
    }
};
