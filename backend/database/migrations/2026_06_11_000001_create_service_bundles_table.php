<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('service_bundles', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('slug')->unique();
            $table->string('name');
            $table->text('tagline')->nullable();
            $table->text('description')->nullable();
            $table->integer('price_cents');                  // monthly price in cents
            $table->integer('setup_fee_cents')->default(0);
            $table->string('stripe_price_id')->nullable();   // Stripe Price ID for recurring billing
            $table->string('stripe_product_id')->nullable();
            $table->jsonb('features')->default('[]');        // array of feature strings shown on pricing card
            $table->jsonb('included_services')->default('[]'); // service slugs included
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->string('highlight_badge')->nullable();   // e.g. "Most Popular"
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('service_bundles');
    }
};
