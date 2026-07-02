<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('training_runs', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('dataset_id')
                ->constrained('training_datasets')
                ->cascadeOnDelete();
            $table->string('status', 20)->default('queued')->index();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('finished_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('training_runs');
    }
};
