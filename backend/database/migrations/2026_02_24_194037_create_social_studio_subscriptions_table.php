<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('social_studio_subscriptions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->unsignedBigInteger('smb_id');
            $table->enum('status', ['active', 'cancelled'])->default('active');
            $table->integer('monthly_credits')->default(200);
            $table->integer('discount_pct')->default(20);
            $table->integer('billing_amount_cents')->default(7900);
            $table->string('stripe_subscription_id')->nullable();
            $table->timestamp('next_credit_refresh_at')->nullable();
            $table->timestamps();

            $table->foreign('smb_id')->references('id')->on('smbs')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('social_studio_subscriptions');
    }
};
