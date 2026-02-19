<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Add Intelligence Hub columns for full profile, AI context, and enrichment.
     */
    public function up(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            if (!Schema::hasColumn('customers', 'ai_context')) {
                if (DB::getDriverName() === 'pgsql') {
                    $table->jsonb('ai_context')->nullable();
                } else {
                    $table->json('ai_context')->nullable();
                }
            }
            if (!Schema::hasColumn('customers', 'customer_intelligence')) {
                if (DB::getDriverName() === 'pgsql') {
                    $table->jsonb('customer_intelligence')->nullable();
                } else {
                    $table->json('customer_intelligence')->nullable();
                }
            }
            if (!Schema::hasColumn('customers', 'competitor_analysis')) {
                if (DB::getDriverName() === 'pgsql') {
                    $table->jsonb('competitor_analysis')->nullable();
                } else {
                    $table->json('competitor_analysis')->nullable();
                }
            }
            if (!Schema::hasColumn('customers', 'survey_responses')) {
                if (DB::getDriverName() === 'pgsql') {
                    $table->jsonb('survey_responses')->nullable();
                } else {
                    $table->json('survey_responses')->nullable();
                }
            }
            if (!Schema::hasColumn('customers', 'profile_completeness')) {
                $table->integer('profile_completeness')->default(0);
            }
            if (!Schema::hasColumn('customers', 'data_sources')) {
                if (DB::getDriverName() === 'pgsql') {
                    $table->jsonb('data_sources')->default(DB::raw("'[]'::jsonb"));
                } else {
                    $table->json('data_sources')->default('[]');
                }
            }
            if (!Schema::hasColumn('customers', 'last_enriched_at')) {
                $table->timestamp('last_enriched_at')->nullable();
            }
        });
    }

    public function down(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            $columns = [
                'ai_context',
                'customer_intelligence',
                'competitor_analysis',
                'survey_responses',
                'profile_completeness',
                'data_sources',
                'last_enriched_at',
            ];
            foreach ($columns as $column) {
                if (Schema::hasColumn('customers', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
