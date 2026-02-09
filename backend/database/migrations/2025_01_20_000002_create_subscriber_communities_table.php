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
        Schema::dropIfExists('subscriber_communities');
        Schema::create('subscriber_communities', function (Blueprint $table) {
            $table->foreignId('subscriber_id')->constrained('subscribers')->onDelete('cascade');
            $table->foreignId('community_id')->constrained('communities')->onDelete('cascade');
            
            // Subscription details
            $table->timestamp('subscribed_at')->useCurrent();
            $table->boolean('is_primary')->default(false); // Their "home" community
            
            // Notification preferences for this community
            $table->boolean('newsletters_enabled')->default(true);
            $table->boolean('alerts_enabled')->default(true);
            
            $table->primary(['subscriber_id', 'community_id']);
            
            $table->index('community_id');
            $table->index('subscriber_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subscriber_communities');
    }
};



