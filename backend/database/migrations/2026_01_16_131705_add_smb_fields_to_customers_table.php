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
        Schema::table('customers', function (Blueprint $table) {
            // Engagement tracking
            $table->integer('engagement_tier')->default(4)->after('lead_score');
            $table->integer('engagement_score')->default(0)->after('engagement_tier');
            
            // Campaign tracking
            $table->enum('campaign_status', [
                'draft', 
                'scheduled', 
                'running', 
                'paused', 
                'completed', 
                'cancelled'
            ])->default('draft')->after('engagement_score');
            
            $table->uuid('current_campaign_id')->nullable()->after('campaign_status');
            $table->integer('manifest_destiny_day')->nullable()->after('current_campaign_id');
            $table->date('manifest_destiny_start_date')->nullable()->after('manifest_destiny_day');
            $table->timestamp('next_scheduled_send')->nullable()->after('manifest_destiny_start_date');
            
            // Service model
            $table->string('service_model')->nullable()->after('next_scheduled_send');
            $table->json('services_activated')->nullable()->after('service_model');
            $table->json('services_approved_pending')->nullable()->after('services_activated');
            
            // Opt-in preferences
            $table->boolean('email_opted_in')->default(true)->after('services_approved_pending');
            $table->boolean('sms_opted_in')->default(false)->after('email_opted_in');
            $table->boolean('rvm_opted_in')->default(false)->after('sms_opted_in');
            $table->boolean('phone_opted_in')->default(false)->after('rvm_opted_in');
            $table->boolean('do_not_contact')->default(false)->after('phone_opted_in');
            
            // Data quality
            $table->integer('data_quality_score')->default(0)->after('do_not_contact');
            
            // Last activity timestamps
            $table->timestamp('last_email_open')->nullable()->after('data_quality_score');
            $table->timestamp('last_email_click')->nullable()->after('last_email_open');
            $table->timestamp('last_content_view')->nullable()->after('last_email_click');
            $table->timestamp('last_approval')->nullable()->after('last_content_view');
            
            // Indexes
            $table->index('engagement_tier');
            $table->index('campaign_status');
            $table->index('manifest_destiny_day');
            $table->index(['campaign_status', 'manifest_destiny_day']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            $table->dropIndex(['campaign_status', 'manifest_destiny_day']);
            $table->dropIndex(['manifest_destiny_day']);
            $table->dropIndex(['campaign_status']);
            $table->dropIndex(['engagement_tier']);
            
            $table->dropColumn([
                'engagement_tier',
                'engagement_score',
                'campaign_status',
                'current_campaign_id',
                'manifest_destiny_day',
                'manifest_destiny_start_date',
                'next_scheduled_send',
                'service_model',
                'services_activated',
                'services_approved_pending',
                'email_opted_in',
                'sms_opted_in',
                'rvm_opted_in',
                'phone_opted_in',
                'do_not_contact',
                'data_quality_score',
                'last_email_open',
                'last_email_click',
                'last_content_view',
                'last_approval',
            ]);
        });
    }
};
