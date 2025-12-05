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
        Schema::create('industry_categories', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('uuid_generate_v4()'));
            $table->string('name', 255);
            $table->string('code', 100)->unique();
            $table->string('parent_industry', 100)->nullable();
            $table->integer('display_order')->default(0);
            $table->timestampTz('created_at')->default(DB::raw('NOW()'));
        });
        
        Schema::create('industry_subcategories', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('uuid_generate_v4()'));
            $table->uuid('industry_id');
            $table->string('name', 255);
            $table->string('code', 100);
            $table->integer('faq_count')->default(0);
            $table->integer('profile_questions_count')->default(0);
            $table->timestampTz('created_at')->default(DB::raw('NOW()'));
            
            $table->foreign('industry_id')->references('id')->on('industry_categories')->onDelete('cascade');
            $table->unique(['industry_id', 'code']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('industry_subcategories');
        Schema::dropIfExists('industry_categories');
    }
};

