<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('workflow_executions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('type')->index(); // e.g. 'business_event_campaign'
            $table->string('status')->index(); // 'running', 'completed', 'failed'
            $table->json('params')->nullable();
            $table->string('initiated_by')->nullable(); // User ID
            $table->timestamp('completed_at')->nullable();
            $table->json('results')->nullable();
            $table->text('error')->nullable();
            $table->timestamps();
        });

        Schema::create('workflow_steps', function (Blueprint $table) {
            $table->id();
            $table->uuid('workflow_execution_id');
            $table->string('step_name');
            $table->string('status'); // 'completed', 'failed'
            $table->json('result')->nullable();
            $table->text('error')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->foreign('workflow_execution_id')
                ->references('id')
                ->on('workflow_executions')
                ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('workflow_steps');
        Schema::dropIfExists('workflow_executions');
    }
};
