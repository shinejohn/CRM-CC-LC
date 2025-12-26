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
        Schema::create('conversation_messages', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('uuid_generate_v4()'));
            $table->uuid('conversation_id');
            
            $table->string('role', 20); // 'user', 'assistant', 'system'
            $table->text('content');
            
            // AI metadata
            $table->integer('tokens_used')->nullable();
            $table->string('model_used', 50)->nullable();
            $table->integer('response_time_ms')->nullable();
            
            // Actions taken
            $table->jsonb('actions_triggered')->nullable();
            
            $table->timestampTz('timestamp')->default(DB::raw('NOW()'));
            
            // Indexes
            $table->index('conversation_id');
            $table->index('timestamp');
            $table->index(['conversation_id', 'timestamp']);
            
            // Foreign key
            $table->foreign('conversation_id')
                  ->references('id')
                  ->on('conversations')
                  ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('conversation_messages');
    }
};
