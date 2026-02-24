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
        Schema::create('cssn_smb_reports', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->unsignedBigInteger('smb_id');
            $table->unsignedBigInteger('community_id');
            $table->date('report_period_start')->nullable();
            $table->date('report_period_end')->nullable();
            $table->integer('total_posts')->default(0);
            $table->bigInteger('total_impressions')->default(0);
            $table->bigInteger('total_reach')->default(0);
            $table->integer('total_engagements')->default(0);
            $table->integer('total_link_clicks')->default(0);
            $table->uuid('top_performing_post_id')->nullable();
            $table->json('platform_breakdown')->nullable();
            $table->integer('syndication_dividend')->default(0);
            $table->timestamp('generated_at')->nullable();
            $table->timestamps();

            $table->foreign('smb_id')->references('id')->on('smbs')->onDelete('cascade');
            $table->foreign('community_id')->references('id')->on('communities')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cssn_smb_reports');
    }
};
