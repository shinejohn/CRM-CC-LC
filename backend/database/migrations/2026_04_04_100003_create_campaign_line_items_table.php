<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('campaign_line_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('campaign_id', 50);
            $table->string('product_type'); // headliner_ad | newsletter_callout | sponsored_article | display_campaign | event_promotion | classified | coupon | announcement | featured_listing
            $table->uuid('product_id')->nullable(); // FK to services table
            $table->string('product_slug')->nullable(); // e.g. headliner, display-ads, article-companion
            $table->decimal('price', 10, 2);
            $table->jsonb('configuration')->default('{}'); // product-specific config: dates, targeting, copy, creative
            $table->string('status')->default('pending'); // pending | active | completed | cancelled | failed
            $table->text('sarah_rationale')->nullable(); // AI-generated explanation for why this was recommended
            $table->integer('sort_order')->default(0);
            $table->timestampTz('started_at')->nullable();
            $table->timestampTz('completed_at')->nullable();
            $table->timestampTz('cancelled_at')->nullable();
            $table->timestamps();

            $table->foreign('campaign_id')->references('id')->on('campaigns')->cascadeOnDelete();
            $table->index(['campaign_id', 'status']);
            $table->index('product_type');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('campaign_line_items');
    }
};
