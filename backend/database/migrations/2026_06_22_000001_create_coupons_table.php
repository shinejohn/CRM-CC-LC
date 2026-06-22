<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('coupons', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('code')->unique();
            $table->string('type');                          // 'percent' or 'fixed'
            $table->integer('amount');                       // fixed: cents; percent: whole-number percent (e.g. 10 = 10%)
            $table->integer('max_uses')->nullable();         // null = unlimited
            $table->integer('uses_count')->default(0);
            $table->timestamp('expires_at')->nullable();
            $table->jsonb('applicable_service_ids')->nullable(); // null = applies to all services
            $table->boolean('active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('coupons');
    }
};
