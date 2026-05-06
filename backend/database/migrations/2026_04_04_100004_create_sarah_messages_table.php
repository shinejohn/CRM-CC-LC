<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sarah_messages', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('business_id')->nullable()->constrained('smbs')->nullOnDelete();
            $table->foreignUuid('advertiser_session_id')->nullable()->constrained()->nullOnDelete();
            $table->string('campaign_id', 50)->nullable();
            $table->string('type'); // intake | proposal | pushback | confirmation | performance | renewal | upsell | follow_up
            $table->string('direction')->default('outbound'); // outbound (Sarah→user) | inbound (user→Sarah)
            $table->text('message');
            $table->jsonb('context')->nullable(); // additional structured data: products mentioned, metrics, etc.
            $table->boolean('actioned')->default(false);
            $table->timestampTz('actioned_at')->nullable();
            $table->string('action_taken')->nullable(); // accepted | declined | ignored
            $table->timestamps();

            $table->foreign('campaign_id')->references('id')->on('campaigns')->nullOnDelete();
            $table->index(['business_id', 'type']);
            $table->index(['campaign_id', 'type']);
            $table->index('actioned');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sarah_messages');
    }
};
