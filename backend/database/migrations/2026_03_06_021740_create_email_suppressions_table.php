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
        Schema::dropIfExists('email_suppressions');

        Schema::create('email_suppressions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('email_address')->index();
            $table->foreignUuid('email_client_id')->nullable()->constrained('email_clients')->cascadeOnDelete();
            $table->string('reason'); // hard_bounce, soft_bounce, complaint, manual
            $table->string('source'); // postal_webhook, api
            $table->timestamps();

            $table->unique(['email_address', 'email_client_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('email_suppressions');
    }
};
