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
        Schema::create('email_pools', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('pool_type')->unique(); // transactional, broadcast, smb_campaign
            $table->string('provider')->default('postal');
            $table->string('host')->nullable();
            $table->integer('port')->nullable();
            $table->string('api_url')->nullable();
            $table->string('api_key')->nullable();
            $table->string('username')->nullable();
            $table->string('password')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('email_pools');
    }
};
