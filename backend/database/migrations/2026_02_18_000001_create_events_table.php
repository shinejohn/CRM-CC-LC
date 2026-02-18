<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('events', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id')->nullable();
            $table->string('title');
            $table->string('slug');
            $table->text('description')->nullable();
            $table->string('location')->nullable();
            $table->string('event_type')->nullable();
            $table->timestamp('start_at');
            $table->timestamp('end_at')->nullable();
            $table->string('status')->default('draft');
            $table->integer('max_attendees')->nullable();
            $table->boolean('is_ticketed')->default(false);
            $table->json('metadata')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('events');
    }
};
