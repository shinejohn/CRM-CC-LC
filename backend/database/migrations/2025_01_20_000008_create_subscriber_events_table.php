<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('subscriber_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('subscriber_id')->constrained('subscribers')->onDelete('cascade');
            
            $table->string('event_type', 50); // signup, verify, login, open, click, unsubscribe
            
            if (DB::getDriverName() === 'pgsql') {
                $table->jsonb('event_data')->nullable();
            } else {
                $table->json('event_data')->nullable();
            }
            
            // Context
            $table->string('ip_address', 50)->nullable();
            $table->text('user_agent')->nullable();
            
            $table->timestamp('created_at')->useCurrent();
            
            $table->index(['subscriber_id', 'created_at']);
            $table->index(['event_type', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subscriber_events');
    }
};



