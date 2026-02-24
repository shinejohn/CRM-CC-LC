<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('cssn_smb_preferences', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->unsignedBigInteger('smb_id');
            $table->boolean('auto_distribute_coupons')->default(true);
            $table->boolean('auto_distribute_events')->default(true);
            $table->boolean('auto_distribute_articles')->default(true);
            $table->boolean('auto_distribute_announcements')->default(false);
            $table->boolean('require_approval_before_post')->default(false);
            $table->time('preferred_post_time')->nullable();
            $table->json('excluded_platforms')->nullable(); // Using JSON array
            $table->text('brand_voice_override')->nullable();
            $table->timestamps();

            $table->foreign('smb_id')->references('id')->on('smbs')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cssn_smb_preferences');
    }
};
