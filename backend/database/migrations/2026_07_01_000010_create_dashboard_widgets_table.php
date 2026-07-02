<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('dashboard_widgets', function (Blueprint $table) {
            $table->uuid('id')->primary();

            // The operator (user) who owns this dashboard layout.
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();

            // Widget identity + presentation.
            $table->string('widget_key', 100);   // maps to frontend CardType (tasks, email, ...)
            $table->string('title', 150);
            $table->string('default_color', 50)->default('lavender');

            // Ordering + grid geometry.
            $table->integer('position')->default(0);

            // layout holds { row, col, rows, cols } to match the frontend
            // DashboardCard { position:{row,col}, size:{rows,cols} } shape.
            // config holds arbitrary per-widget settings.
            if (DB::getDriverName() === 'pgsql') {
                $table->jsonb('layout')->nullable();
                $table->jsonb('config')->nullable();
            } else {
                $table->json('layout')->nullable();
                $table->json('config')->nullable();
            }

            $table->boolean('is_visible')->default(true);

            $table->timestamps();

            $table->index('user_id');
            // A user has at most one row per widget_key (used for upserts).
            $table->unique(['user_id', 'widget_key']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('dashboard_widgets');
    }
};
