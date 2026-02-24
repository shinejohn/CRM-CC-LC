<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('social_studio_credits', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->unsignedBigInteger('smb_id')->unique();
            $table->integer('balance')->default(0);
            $table->integer('lifetime_purchased')->default(0);
            $table->integer('lifetime_consumed')->default(0);
            $table->timestamps();

            $table->foreign('smb_id')->references('id')->on('smbs')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('social_studio_credits');
    }
};
