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
        Schema::create('cssn_subscriptions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->unsignedBigInteger('smb_id');
            $table->unsignedBigInteger('community_id');
            $table->enum('tier', ['local', 'reach', 'network', 'enterprise']);
            $table->enum('mode', ['subscription', 'campaign'])->default('subscription');
            $table->enum('status', ['active', 'paused', 'cancelled', 'expired']);
            $table->date('campaign_start_date')->nullable();
            $table->date('campaign_end_date')->nullable();
            $table->json('cross_community_ids')->nullable(); // Using JSON array since array primitive isn't standard in all DBMS
            $table->integer('billing_amount_cents');
            $table->enum('billing_interval', ['monthly', 'one_time']);
            $table->string('stripe_subscription_id')->nullable();
            $table->timestamp('activated_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
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
        Schema::dropIfExists('cssn_subscriptions');
    }
};
