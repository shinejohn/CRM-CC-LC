<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('approvals', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->uuid('customer_id');
            $table->foreign('customer_id')->references('id')->on('customers');

            $table->string('service_type', 100);
            $table->foreignId('task_id')->nullable();

            $table->string('approver_name');
            $table->string('approver_email');
            $table->string('approver_phone', 50)->nullable();
            $table->string('approver_role', 100)->nullable();

            $table->string('source_type', 50);
            $table->string('source_id', 100)->nullable();
            $table->text('source_url')->nullable();

            $table->boolean('contact_consent')->default(false);
            $table->string('status', 50)->default('pending');

            $table->timestamp('approved_at');
            $table->timestamp('provisioning_started_at')->nullable();
            $table->timestamp('provisioned_at')->nullable();

            if (DB::getDriverName() === 'pgsql') {
                $table->jsonb('metadata')->default(DB::raw("'{}'::jsonb"));
            } else {
                $table->json('metadata')->default('{}');
            }
            $table->timestamps();

            $table->index('customer_id');
            $table->index('service_type');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('approvals');
    }
};

