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
        Schema::create('customer_faqs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id');
            $table->uuid('customer_id');
            
            $table->text('question');
            $table->text('answer');
            $table->string('short_answer', 255)->nullable();
            
            $table->string('category', 50)->nullable();
            $table->json('keywords')->nullable(); // Array
            
            // Source tracking (how we learned this)
            $table->string('source', 50); // 'owner_conversation', 'website_scrape', 'manual', 'inferred'
            $table->string('confidence', 20); // 'confirmed', 'likely', 'needs_verification'
            $table->uuid('source_conversation_id')->nullable();
            
            // Verification
            $table->boolean('verified_by_owner')->default(false);
            $table->timestampTz('verified_at')->nullable();
            
            // For AI handling
            $table->boolean('should_ask_clarification')->default(false);
            $table->text('clarification_question')->nullable();
            
            // Status
            $table->boolean('is_active')->default(true);
            
            $table->timestampTz('created_at')->default(DB::raw('NOW()'));
            $table->timestampTz('updated_at')->default(DB::raw('NOW()'));
            
            // Indexes
            $table->index('tenant_id');
            $table->index('customer_id');
            $table->index(['customer_id', 'is_active']);
            $table->index('source');
            
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
        Schema::dropIfExists('customer_faqs');
    }
};
