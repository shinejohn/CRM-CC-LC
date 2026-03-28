<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('community_subscriptions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('customer_id');
            $table->unsignedBigInteger('community_id');
            $table->string('product_slug');
            $table->string('tier')->default('influencer');
            $table->string('status')->default('pending');

            // Billing
            $table->decimal('monthly_rate', 10, 2);
            $table->string('stripe_subscription_id')->nullable();
            $table->string('stripe_customer_id')->nullable();

            // Commitment
            $table->integer('commitment_months')->default(12);
            $table->timestamp('commitment_starts_at')->nullable();
            $table->timestamp('commitment_ends_at')->nullable();
            $table->integer('bonus_months')->default(3);
            $table->timestamp('bonus_starts_at')->nullable();
            $table->timestamp('bonus_ends_at')->nullable();
            $table->timestamp('next_renewal_at')->nullable();

            // Founder pricing
            $table->boolean('is_founder_pricing')->default(false);
            $table->timestamp('founder_lock_expires_at')->nullable();

            // Slot tracking
            $table->string('category_group')->nullable();
            $table->string('category_subtype')->nullable();

            // Expert-specific
            $table->string('expert_column_name')->nullable();
            $table->string('expert_column_slug')->nullable();

            // Sponsor-specific
            $table->string('sponsored_section')->nullable();
            $table->decimal('section_price', 10, 2)->nullable();

            // Cancellation
            $table->timestamp('cancelled_at')->nullable();
            $table->string('cancellation_reason')->nullable();
            $table->decimal('early_termination_balance', 10, 2)->nullable();

            $table->timestamps();
            $table->foreign('customer_id')->references('id')->on('customers');
            $table->foreign('community_id')->references('id')->on('communities');
            $table->index(['community_id', 'product_slug', 'status']);
            $table->index(['customer_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('community_subscriptions');
    }
};
