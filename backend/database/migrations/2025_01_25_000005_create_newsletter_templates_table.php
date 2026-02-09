<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('newsletter_templates', function (Blueprint $table) {
            $table->id();
            
            // Identity
            $table->string('slug', 100)->unique();
            $table->string('name', 255);
            $table->text('description')->nullable();
            
            // Type
            $table->string('newsletter_type', 20)->comment('daily, weekly');
            
            // Template
            if (DB::getDriverName() === 'pgsql') {
                $table->jsonb('structure_json')->comment('Section definitions');
            } else {
                $table->json('structure_json');
            }
            $table->text('html_template')->comment('Handlebars/Blade template');
            
            // Status
            $table->boolean('is_active')->default(true);
            $table->boolean('is_default')->default(false);
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('newsletter_templates');
    }
};



