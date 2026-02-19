<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('email_events')) {
            return;
        }
        Schema::create('email_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('campaign_send_id')->constrained();

            $table->string('event_type', 50);
            $table->timestamp('event_at');

            $table->text('link_clicked')->nullable();
            $table->string('bounce_type', 50)->nullable();

            $table->ipAddress('ip_address')->nullable();
            $table->text('user_agent')->nullable();

            if (DB::getDriverName() === 'pgsql') {
                $table->jsonb('raw_event')->nullable();
            } else {
                $table->json('raw_event')->nullable();
            }
            $table->timestamps();

            $table->index('campaign_send_id');
            $table->index('event_type');
            $table->index('event_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('email_events');
    }
};



