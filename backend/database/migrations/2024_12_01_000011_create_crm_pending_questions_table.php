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
        Schema::create('pending_questions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id');
            $table->uuid('customer_id');
            
            // What this question answers
            $table->string('field_to_populate', 100);
            $table->string('table_to_update', 50)->default('customers');
            
            // The question
            $table->text('question');
            $table->text('context')->nullable(); // Why we're asking / when to ask
            $table->json('alternative_phrasings')->nullable(); // Array
            
            // Priority (when to ask)
            $table->integer('priority')->default(5); // 1-10, higher = more important
            $table->json('ask_during')->nullable(); // Array: ['onboarding', 'pricing_discussion', 'any']
            
            // Status
            $table->boolean('asked')->default(false);
            $table->timestamp('asked_at')->nullable();
            $table->uuid('asked_in_conversation_id')->nullable();
            
            $table->boolean('answered')->default(false);
            $table->text('answer')->nullable();
            $table->timestamp('answered_at')->nullable();
            
            // If answer needs verification
            $table->boolean('needs_verification')->default(false);
            $table->boolean('verified')->default(false);
            
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();
            
            // Indexes
            $table->index('tenant_id');
            $table->index('customer_id');
            $table->index(['customer_id', 'asked', 'answered']);
            $table->index('priority');
            
            // Foreign key
            $table->foreign('customer_id')
                  ->references('id')
                  ->on('customers')
                  ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pending_questions');
    }
};
