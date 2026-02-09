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
        Schema::create('unsubscribe_tokens', function (Blueprint $table) {
            $table->id();
            $table->foreignId('subscriber_id')->constrained('subscribers')->onDelete('cascade');
            
            $table->string('token', 100)->unique();
            
            // Scope
            $table->string('scope', 50); // all, community, newsletter, alerts
            $table->unsignedBigInteger('scope_id')->nullable(); // community_id if scope is community
            
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('used_at')->nullable();
            
            $table->index('token');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('unsubscribe_tokens');
    }
};



