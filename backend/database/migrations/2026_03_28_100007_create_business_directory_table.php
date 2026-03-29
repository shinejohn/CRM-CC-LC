<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('business_directory', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->unsignedBigInteger('community_id')->nullable();
            $table->string('business_name');
            $table->string('city')->nullable();
            $table->string('state', 2)->nullable();
            $table->string('category')->nullable();
            $table->string('source', 50)->default('overture');
            $table->unsignedBigInteger('claimed_smb_id')->nullable();
            $table->timestampTz('claimed_at')->nullable();
            if (DB::getDriverName() === 'pgsql') {
                $table->jsonb('metadata')->nullable();
            } else {
                $table->json('metadata')->nullable();
            }
            $table->timestamps();

            $table->index(['community_id', 'business_name']);
            $table->index('claimed_smb_id');

            $table->foreign('community_id')->references('id')->on('communities')->nullOnDelete();
            $table->foreign('claimed_smb_id')->references('id')->on('smbs')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('business_directory');
    }
};
