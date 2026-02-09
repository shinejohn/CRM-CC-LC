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
        Schema::create('subscriber_alert_preferences', function (Blueprint $table) {
            $table->foreignId('subscriber_id')->constrained('subscribers')->onDelete('cascade');
            $table->string('category_slug', 50); // breaking, weather, traffic, etc.
            
            // Channel preferences for this category
            $table->boolean('email_enabled')->default(true);
            $table->boolean('sms_enabled')->default(false);
            $table->boolean('push_enabled')->default(true);
            
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();
            
            $table->primary(['subscriber_id', 'category_slug']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subscriber_alert_preferences');
    }
};



