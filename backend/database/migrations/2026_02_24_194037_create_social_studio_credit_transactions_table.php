<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('social_studio_credit_transactions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->unsignedBigInteger('smb_id');
            $table->enum('type', ['purchase', 'consume', 'refund', 'bonus', 'expiry']);
            $table->integer('amount'); // positive = credits added, negative = consumed
            $table->integer('balance_after');
            $table->string('action_type')->nullable(); // e.g. 'post_copy', 'event_card'
            $table->uuid('content_id')->nullable(); // reference to generated content once that table exists
            $table->string('stripe_payment_intent_id')->nullable();
            $table->timestamps();

            $table->foreign('smb_id')->references('id')->on('smbs')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('social_studio_credit_transactions');
    }
};
