<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('smbs', function (Blueprint $table) {
            if (! Schema::hasColumn('smbs', 'org_type')) {
                $table->string('org_type')->nullable()->after('category');
            }
            if (! Schema::hasColumn('smbs', 'pitch_track')) {
                $table->string('pitch_track')->nullable()->after('org_type');
            }
            if (! Schema::hasColumn('smbs', 'has_events')) {
                $table->boolean('has_events')->default(false)->after('pitch_track');
            }
            if (! Schema::hasColumn('smbs', 'has_venue')) {
                $table->boolean('has_venue')->default(false)->after('has_events');
            }
            if (! Schema::hasColumn('smbs', 'is_performer')) {
                $table->boolean('is_performer')->default(false)->after('has_venue');
            }
            if (! Schema::hasColumn('smbs', 'website_exists')) {
                $table->boolean('website_exists')->nullable()->after('is_performer');
            }
            if (! Schema::hasColumn('smbs', 'website_current')) {
                $table->boolean('website_current')->nullable()->after('website_exists');
            }
            if (! Schema::hasColumn('smbs', 'primary_goal')) {
                $table->string('primary_goal')->nullable()->after('website_current');
            }
            if (! Schema::hasColumn('smbs', 'customer_source')) {
                $table->string('customer_source')->nullable()->after('primary_goal');
            }
            if (! Schema::hasColumn('smbs', 'marketing_spend_range')) {
                $table->string('marketing_spend_range')->nullable()->after('customer_source');
            }
            if (! Schema::hasColumn('smbs', 'communities_of_interest')) {
                if (DB::getDriverName() === 'pgsql') {
                    $table->jsonb('communities_of_interest')->nullable()->after('marketing_spend_range');
                } else {
                    $table->json('communities_of_interest')->nullable()->after('marketing_spend_range');
                }
            }
            if (! Schema::hasColumn('smbs', 'gates_completed')) {
                if (DB::getDriverName() === 'pgsql') {
                    $table->jsonb('gates_completed')->nullable();
                } else {
                    $table->json('gates_completed')->nullable();
                }
            }
            if (! Schema::hasColumn('smbs', 'gates_deferred')) {
                if (DB::getDriverName() === 'pgsql') {
                    $table->jsonb('gates_deferred')->nullable();
                } else {
                    $table->json('gates_deferred')->nullable();
                }
            }
            if (! Schema::hasColumn('smbs', 'products_accepted')) {
                if (DB::getDriverName() === 'pgsql') {
                    $table->jsonb('products_accepted')->nullable();
                } else {
                    $table->json('products_accepted')->nullable();
                }
            }
            if (! Schema::hasColumn('smbs', 'products_declined')) {
                if (DB::getDriverName() === 'pgsql') {
                    $table->jsonb('products_declined')->nullable();
                } else {
                    $table->json('products_declined')->nullable();
                }
            }
            if (! Schema::hasColumn('smbs', 'products_deferred')) {
                if (DB::getDriverName() === 'pgsql') {
                    $table->jsonb('products_deferred')->nullable();
                } else {
                    $table->json('products_deferred')->nullable();
                }
            }
            if (! Schema::hasColumn('smbs', 'pitch_status')) {
                $table->string('pitch_status')->nullable();
            }
            if (! Schema::hasColumn('smbs', 'active_pitch_session_id')) {
                $table->uuid('active_pitch_session_id')->nullable();
            }
            if (! Schema::hasColumn('smbs', 'converted_campaign_id')) {
                $table->string('converted_campaign_id', 50)->nullable();
            }
            if (! Schema::hasColumn('smbs', 'proposal_value')) {
                $table->decimal('proposal_value', 10, 2)->nullable();
            }
            if (! Schema::hasColumn('smbs', 'founder_days_remaining')) {
                $table->integer('founder_days_remaining')->nullable();
            }
            if (! Schema::hasColumn('smbs', 'pitch_started_at')) {
                $table->timestampTz('pitch_started_at')->nullable();
            }
            if (! Schema::hasColumn('smbs', 'pitch_completed_at')) {
                $table->timestampTz('pitch_completed_at')->nullable();
            }
            if (! Schema::hasColumn('smbs', 'last_pitch_activity_at')) {
                $table->timestampTz('last_pitch_activity_at')->nullable();
            }
        });
    }

    public function down(): void
    {
        Schema::table('smbs', function (Blueprint $table) {
            $cols = [
                'org_type', 'pitch_track', 'has_events', 'has_venue', 'is_performer',
                'website_exists', 'website_current', 'primary_goal', 'customer_source',
                'marketing_spend_range', 'communities_of_interest', 'gates_completed',
                'gates_deferred', 'products_accepted', 'products_declined', 'products_deferred',
                'pitch_status', 'active_pitch_session_id', 'converted_campaign_id',
                'proposal_value', 'founder_days_remaining', 'pitch_started_at',
                'pitch_completed_at', 'last_pitch_activity_at',
            ];
            foreach ($cols as $c) {
                if (Schema::hasColumn('smbs', $c)) {
                    $table->dropColumn($c);
                }
            }
        });
    }
};
