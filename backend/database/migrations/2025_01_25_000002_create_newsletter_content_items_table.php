<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('newsletter_content_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('newsletter_id')->constrained('newsletters')->onDelete('cascade');
            
            // Content reference
            $table->string('content_type', 50)->comment('article, event, sponsor, announcement');
            $table->unsignedBigInteger('content_id')->nullable()->comment('Reference to source content');
            
            // Display
            $table->integer('position')->comment('Order in newsletter');
            $table->string('section', 50)->nullable()->comment('top_stories, events, sponsor_spotlight, etc.');
            
            // Inline content (if not referencing external)
            $table->string('headline', 255)->nullable();
            $table->text('summary')->nullable();
            $table->string('image_url', 500)->nullable();
            $table->string('link_url', 500)->nullable();
            
            // Tracking
            $table->integer('click_count')->default(0);
            
            $table->timestamp('created_at')->useCurrent();
        });
        
        Schema::table('newsletter_content_items', function (Blueprint $table) {
            $table->index(['newsletter_id', 'position'], 'idx_nl_content_newsletter');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('newsletter_content_items');
    }
};



