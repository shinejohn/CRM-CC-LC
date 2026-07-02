<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('training_examples', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('dataset_id')
                ->constrained('training_datasets')
                ->cascadeOnDelete();
            $table->text('input');
            $table->text('expected_output')->nullable();
            $table->string('category')->nullable()->index();
            $table->string('validation_status', 20)->default('pending')->index();
            $table->uuid('reviewed_by')->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index(['dataset_id', 'validation_status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('training_examples');
    }
};
