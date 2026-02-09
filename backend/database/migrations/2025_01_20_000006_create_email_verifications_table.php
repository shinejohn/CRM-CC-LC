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
        Schema::create('email_verifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('subscriber_id')->constrained('subscribers')->onDelete('cascade');
            
            $table->string('token', 100)->unique();
            $table->string('email', 255); // Email being verified (may differ from current)
            
            $table->timestamp('expires_at');
            $table->timestamp('verified_at')->nullable();
            
            $table->timestamp('created_at')->useCurrent();
            
            $table->index(['token', 'verified_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('email_verifications');
    }
};



