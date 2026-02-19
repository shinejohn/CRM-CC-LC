<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('analytics_events')) {
            return;
        }
        Schema::create('analytics_events', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('smb_id')->nullable();
            $table->unsignedBigInteger('community_id')->nullable();

            $table->string('event_type', 100);
            $table->string('event_category', 50)->nullable();

            if (DB::getDriverName() === 'pgsql') {
                $table->jsonb('properties')->default(DB::raw("'{}'::jsonb"));
            } else {
                $table->json('properties')->default('{}');
            }

            $table->timestamp('occurred_at');
            $table->timestamps();

            $table->index(['event_type', 'occurred_at']);
            $table->index('smb_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('analytics_events');
    }
};



