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
        Schema::create('crm_notifications', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id');
            $table->uuid('user_id')->nullable(); // null = all users in tenant
            $table->string('type')->default('info'); // info, success, warning, error, message
            $table->string('category')->nullable(); // Payment, Message, Calendar, Invoice, Team, etc.
            $table->string('title');
            $table->text('message');
            $table->boolean('read')->default(false);
            $table->timestamp('read_at')->nullable();
            $table->boolean('important')->default(false);
            $table->boolean('archived')->default(false);
            $table->string('action_label')->nullable();
            $table->string('action_url')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index(['tenant_id', 'read']);
            $table->index(['tenant_id', 'user_id']);
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('crm_notifications');
    }
};
