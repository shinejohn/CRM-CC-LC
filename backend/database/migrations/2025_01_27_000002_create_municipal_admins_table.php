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
        Schema::create('municipal_admins', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('community_id')->constrained('communities')->onDelete('cascade');
            
            // Role
            $table->string('title', 255); // Emergency Manager, Fire Chief, Police Chief, Mayor
            $table->string('department', 255)->nullable();
            
            // Permissions
            $table->boolean('can_send_emergency')->default(false);
            $table->boolean('can_send_test')->default(true);
            
            // Extra security
            $table->string('authorization_pin_hash', 255); // Hashed 6-digit PIN
            
            // Contact for verification
            $table->string('phone', 50);
            
            // Status
            $table->boolean('is_active')->default(true);
            $table->timestamp('verified_at')->nullable();
            $table->string('verified_by', 255)->nullable(); // Who verified this admin
            
            $table->timestamps();
            
            $table->unique(['user_id', 'community_id']);
            $table->index(['is_active', 'can_send_emergency']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('municipal_admins');
    }
};



