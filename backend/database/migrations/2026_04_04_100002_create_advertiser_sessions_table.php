<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('advertiser_sessions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('business_id')->nullable()->constrained('smbs')->nullOnDelete();
            $table->foreignUuid('user_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignUuid('community_id')->constrained()->cascadeOnDelete();
            $table->string('source_platform'); // day_news | goeventcity | downtownguide | golocalvoices
            $table->string('source_url');
            $table->uuid('source_article_id')->nullable();
            $table->string('visitor_type')->default('guest'); // guest | user | business_owner
            $table->jsonb('intake_answers')->nullable(); // goal, timeline, budget responses
            $table->jsonb('proposal')->nullable(); // recommended products + rationale
            $table->string('status')->default('intake'); // intake | proposed | negotiating | converted | abandoned
            $table->string('campaign_id', 50)->nullable();
            $table->string('business_name')->nullable();
            $table->string('business_category')->nullable();
            $table->timestampTz('last_active_at')->nullable();
            $table->timestampTz('converted_at')->nullable();
            $table->timestampTz('abandoned_at')->nullable();
            $table->timestamps();

            $table->foreign('campaign_id')->references('id')->on('campaigns')->nullOnDelete();
            $table->index(['community_id', 'status']);
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('advertiser_sessions');
    }
};
