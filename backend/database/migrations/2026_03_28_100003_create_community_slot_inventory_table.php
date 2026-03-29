<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('community_slot_inventory', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->unsignedBigInteger('community_id');
            $table->string('platform');
            $table->string('slot_type');
            $table->string('category');
            $table->integer('total_slots');
            $table->integer('held_slots')->default(0);
            if (DB::getDriverName() === 'pgsql') {
                $table->jsonb('held_by')->nullable();
            } else {
                $table->json('held_by')->nullable();
            }
            $table->timestamps();

            $table->unique(['community_id', 'platform', 'slot_type', 'category'], 'community_slot_inventory_unique_slot');
            $table->index('community_id');

            $table->foreign('community_id')->references('id')->on('communities')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('community_slot_inventory');
    }
};
