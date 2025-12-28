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
        Schema::create('survey_sections', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id');
            $table->string('name', 255);
            $table->text('description')->nullable();
            $table->integer('display_order')->default(0);
            $table->boolean('is_required')->default(true);
            $table->boolean('is_conditional')->default(false);
            $table->jsonb('condition_config')->nullable();
            $table->timestampTz('created_at')->default(DB::raw('NOW()'));
            $table->timestampTz('updated_at')->default(DB::raw('NOW()'));
            
            $table->index('tenant_id');
        });
        
        Schema::create('survey_questions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('section_id');
            $table->text('question_text');
            $table->text('help_text')->nullable();
            $table->string('question_type', 50);
            $table->boolean('is_required')->default(false);
            $table->integer('display_order')->default(0);
            
            // Validation
            $table->jsonb('validation_rules')->nullable();
            
            // Options for select/multi-select
            $table->jsonb('options')->nullable();
            
            // Scale config
            $table->jsonb('scale_config')->nullable();
            
            // Conditional display
            $table->boolean('is_conditional')->default(false);
            $table->jsonb('show_when')->nullable();
            
            // AI/Data enrichment
            $table->string('auto_populate_source', 20)->nullable();
            $table->boolean('requires_owner_verification')->default(false);
            
            // Industry targeting
            $table->boolean('industry_specific')->default(false);
            $table->json('applies_to_industries')->nullable();
            
            $table->timestampTz('created_at')->default(DB::raw('NOW()'));
            $table->timestampTz('updated_at')->default(DB::raw('NOW()'));
            
            $table->foreign('section_id')->references('id')->on('survey_sections')->onDelete('cascade');
            $table->index('section_id');
            $table->index('question_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('survey_questions');
        Schema::dropIfExists('survey_sections');
    }
};






