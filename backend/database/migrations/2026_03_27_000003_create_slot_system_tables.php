<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('community_slot_limits', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->unsignedBigInteger('community_id');
            $table->string('category_group');
            $table->string('category_subtype')->nullable();
            $table->integer('max_influencer_slots');
            $table->integer('max_expert_slots')->default(1);
            $table->integer('current_influencer_count')->default(0);
            $table->integer('current_expert_count')->default(0);
            $table->timestamps();
            $table->unique(['community_id', 'category_group', 'category_subtype'], 'slot_limit_unique');
            $table->foreign('community_id')->references('id')->on('communities');
        });

        Schema::create('influencer_waitlist', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->unsignedBigInteger('community_id');
            $table->uuid('customer_id');
            $table->string('category_group');
            $table->string('category_subtype')->nullable();
            $table->string('product_slug');
            $table->integer('position');
            $table->timestamp('requested_at');
            $table->timestamp('notified_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->string('status')->default('waiting');
            $table->timestamps();
            $table->foreign('community_id')->references('id')->on('communities');
            $table->foreign('customer_id')->references('id')->on('customers');
            $table->index(['community_id', 'category_group', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('influencer_waitlist');
        Schema::dropIfExists('community_slot_limits');
    }
};
