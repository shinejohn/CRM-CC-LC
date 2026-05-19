<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sarah_notebooks', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('customer_id')->constrained()->cascadeOnDelete();
            $table->string('purpose', 50)->default('profile');
            $table->string('status', 20)->default('draft');
            $table->jsonb('data')->default('{}');
            $table->jsonb('field_log')->default('{}');
            $table->decimal('completeness', 5, 2)->default(0);
            $table->timestampTz('committed_at')->nullable();
            $table->timestamps();

            $table->unique(['customer_id', 'purpose']);
            $table->index('status');
        });

        Schema::create('sarah_notebook_entries', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('notebook_id')->constrained('sarah_notebooks')->cascadeOnDelete();
            $table->string('field_name', 100);
            $table->text('old_value')->nullable();
            $table->text('new_value')->nullable();
            $table->string('source', 30);
            $table->string('source_detail')->nullable();
            $table->timestampTz('created_at')->useCurrent();

            $table->index(['notebook_id', 'field_name']);
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sarah_notebook_entries');
        Schema::dropIfExists('sarah_notebooks');
    }
};
