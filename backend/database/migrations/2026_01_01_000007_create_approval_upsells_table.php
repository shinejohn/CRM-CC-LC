<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('approval_upsells')) {
            return;
        }
        Schema::create('approval_upsells', function (Blueprint $table) {
            $table->id();
            $table->foreignId('approval_id')->constrained();
            $table->string('upsell_service_type', 100);

            $table->timestamp('offered_at');
            $table->boolean('accepted')->nullable();
            $table->timestamp('accepted_at')->nullable();
            $table->timestamp('declined_at')->nullable();

            $table->foreignId('resulting_approval_id')->nullable()->constrained('approvals');

            $table->index('approval_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('approval_upsells');
    }
};



