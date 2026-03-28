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
        Schema::create('email_senders', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('email_client_id')->constrained('email_clients')->cascadeOnDelete();
            $table->string('email_address');
            $table->boolean('is_verified')->default(false);
            $table->timestamps();

            $table->unique(['email_client_id', 'email_address']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('email_senders');
    }
};
