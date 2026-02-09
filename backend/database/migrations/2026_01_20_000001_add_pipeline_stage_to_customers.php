<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            $table->string('pipeline_stage')->default('hook')->after('campaign_status');
            $table->timestamp('stage_entered_at')->nullable()->after('pipeline_stage');
            $table->timestamp('trial_started_at')->nullable()->after('stage_entered_at');
            $table->timestamp('trial_ends_at')->nullable()->after('trial_started_at');
            $table->boolean('trial_active')->default(false)->after('trial_ends_at');
            $table->integer('days_in_stage')->default(0)->after('trial_ends_at');
            $table->json('stage_history')->nullable()->after('days_in_stage');

            $table->index('pipeline_stage');
            $table->index('stage_entered_at');
        });
    }

    public function down(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            $table->dropIndex(['stage_entered_at']);
            $table->dropIndex(['pipeline_stage']);
            $table->dropColumn([
                'pipeline_stage',
                'stage_entered_at',
                'trial_started_at',
                'trial_ends_at',
                'days_in_stage',
                'stage_history'
            ]);
        });
    }
};

