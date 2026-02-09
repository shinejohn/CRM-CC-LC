<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('provisioning_tasks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('approval_id')->constrained();
            $table->uuid('customer_id');
            $table->foreign('customer_id')->references('id')->on('customers');

            $table->string('service_type', 100);
            $table->string('status', 50)->default('queued');
            $table->integer('priority')->default(5);

            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamp('failed_at')->nullable();
            $table->text('failure_reason')->nullable();

            if (DB::getDriverName() === 'pgsql') {
                $table->jsonb('result_data')->default(DB::raw("'{}'::jsonb"));
            } else {
                $table->json('result_data')->default('{}');
            }
            $table->timestamps();

            $table->index(['status', 'priority']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('provisioning_tasks');
    }
};

