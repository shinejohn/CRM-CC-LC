<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('smbs', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('community_id')->constrained();

            $table->string('business_name');
            $table->string('dba_name')->nullable();
            $table->string('business_type', 100)->nullable();
            $table->string('category', 100)->nullable();

            $table->string('primary_contact_name')->nullable();
            $table->string('primary_email')->nullable();
            $table->string('primary_phone', 50)->nullable();
            if (DB::getDriverName() === 'pgsql') {
                $table->jsonb('secondary_contacts')->default(DB::raw("'[]'::jsonb"));
            } else {
                $table->json('secondary_contacts')->default('[]');
            }

            $table->string('address')->nullable();
            $table->string('city', 100)->nullable();
            $table->string('state', 2)->nullable();
            $table->string('zip', 10)->nullable();
            if (DB::getDriverName() === 'pgsql') {
                $table->jsonb('coordinates')->nullable();
            } else {
                $table->json('coordinates')->nullable();
            }

            $table->tinyInteger('engagement_tier')->default(4);
            $table->integer('engagement_score')->default(0);
            $table->timestamp('last_email_open')->nullable();
            $table->timestamp('last_email_click')->nullable();
            $table->timestamp('last_content_view')->nullable();
            $table->timestamp('last_approval')->nullable();
            $table->integer('total_approvals')->default(0);
            $table->integer('total_meetings')->default(0);

            $table->string('campaign_status', 50)->default('pending');
            $table->string('current_campaign_id', 50)->nullable();
            $table->integer('manifest_destiny_day')->default(0);
            $table->date('manifest_destiny_start_date')->nullable();
            $table->timestamp('next_scheduled_send')->nullable();

            $table->string('service_model', 50)->nullable();
            $table->string('subscription_tier', 50)->default('free');
            if (DB::getDriverName() === 'pgsql') {
                $table->jsonb('services_activated')->default(DB::raw("'[]'::jsonb"));
                $table->jsonb('services_approved_pending')->default(DB::raw("'[]'::jsonb"));
            } else {
                $table->json('services_activated')->default('[]');
                $table->json('services_approved_pending')->default('[]');
            }

            $table->boolean('email_opted_in')->default(true);
            $table->boolean('sms_opted_in')->default(false);
            $table->boolean('rvm_opted_in')->default(true);
            $table->boolean('phone_opted_in')->default(false);
            $table->boolean('do_not_contact')->default(false);

            $table->string('source', 50)->nullable();
            $table->integer('data_quality_score')->default(0);
            if (DB::getDriverName() === 'pgsql') {
                $table->jsonb('metadata')->default(DB::raw("'{}'::jsonb"));
            } else {
                $table->json('metadata')->default('{}');
            }

            $table->timestamps();
            $table->softDeletes();

            $table->index('community_id');
            $table->index('primary_email');
            $table->index('primary_phone');
            $table->index('campaign_status');
            $table->index('engagement_tier');
            $table->index(['campaign_status', 'manifest_destiny_day']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('smbs');
    }
};

