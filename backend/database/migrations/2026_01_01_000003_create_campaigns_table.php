<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('campaigns')) {
            return;
        }
        Schema::create('campaigns', function (Blueprint $table) {
            $table->string('id', 50)->primary();
            $table->string('type', 50);
            $table->integer('week');
            $table->integer('day');
            $table->string('title');
            $table->string('subject');
            $table->string('slug');
            $table->string('service_type', 100)->nullable();

            $table->string('landing_page_slug')->nullable();
            $table->string('email_template_id', 100)->nullable();

            $table->string('approval_button_text')->nullable();
            if (DB::getDriverName() === 'pgsql') {
                $table->jsonb('approval_config')->default(DB::raw("'{}'::jsonb"));
            } else {
                $table->json('approval_config')->default('{}');
            }

            $table->text('rvm_script')->nullable();
            if (DB::getDriverName() === 'pgsql') {
                $table->jsonb('rvm_config')->default(DB::raw("'{}'::jsonb"));
            } else {
                $table->json('rvm_config')->default('{}');
            }

            if (DB::getDriverName() === 'pgsql') {
                $table->jsonb('upsell_services')->default(DB::raw("'[]'::jsonb"));
            } else {
                $table->json('upsell_services')->default('[]');
            }
            $table->string('meeting_topic')->nullable();

            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('campaigns');
    }
};



