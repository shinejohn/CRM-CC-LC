<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('revenue_records')) {
            return;
        }

        Schema::create('revenue_records', function (Blueprint $table) {
            $table->uuid('id')->primary();

            if (Schema::hasTable('communities')) {
                $table->foreignUuid('community_id')->nullable()->constrained('communities')->nullOnDelete();
            } else {
                $table->uuid('community_id')->nullable();
            }

            $table->decimal('amount', 12, 2)->default(0);
            $table->string('source', 100)->nullable();
            $table->text('description')->nullable();
            $table->timestampTz('recorded_at')->nullable();

            $table->timestamps();

            $table->index('community_id');
            $table->index('recorded_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('revenue_records');
    }
};
