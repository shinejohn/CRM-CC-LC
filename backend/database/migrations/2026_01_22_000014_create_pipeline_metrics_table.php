<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (DB::getDriverName() !== 'pgsql') {
            return;
        }

        // Set search path to ops schema for table creation
        DB::statement('SET search_path TO ops, public');

        Schema::create('pipeline_metrics', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::getDriverName() === 'pgsql' ? DB::raw('gen_random_uuid()') : null);
            
            // Time
            $table->date('snapshot_date');
            
            // Pipeline by Stage
            $table->integer('leads_total')->nullable();
            $table->integer('leads_new_today')->nullable();
            
            $table->integer('prospects_total')->nullable();
            $table->integer('prospects_in_hook_trial')->nullable();
            
            $table->integer('opportunities_total')->nullable();
            $table->decimal('opportunities_value', 12, 2)->nullable();
            
            $table->integer('customers_converting_today')->nullable();
            $table->integer('customers_total')->nullable();
            
            // Conversion Rates
            $table->decimal('lead_to_prospect_rate', 5, 4)->nullable();
            $table->decimal('prospect_to_opportunity_rate', 5, 4)->nullable();
            $table->decimal('opportunity_to_customer_rate', 5, 4)->nullable();
            $table->decimal('overall_conversion_rate', 5, 4)->nullable();
            
            // Velocity
            $table->decimal('avg_days_lead_to_customer', 6, 2)->nullable();
            $table->decimal('avg_days_in_hook_trial', 6, 2)->nullable();
            
            // Campaign Performance
            $table->integer('campaign_emails_sent')->nullable();
            $table->integer('campaign_emails_opened')->nullable();
            $table->decimal('campaign_open_rate', 5, 4)->nullable();
            $table->integer('campaign_clicks')->nullable();
            $table->decimal('campaign_click_rate', 5, 4)->nullable();
            
            // By Community
            $table->integer('communities_with_pipeline')->nullable();
            $table->decimal('avg_pipeline_per_community', 10, 2)->nullable();
            
            // Forecasting
            $table->integer('projected_conversions_7d')->nullable();
            $table->decimal('projected_mrr_7d', 12, 2)->nullable();
            $table->integer('projected_conversions_30d')->nullable();
            $table->decimal('projected_mrr_30d', 12, 2)->nullable();
            
            $table->timestampTz('computed_at')->useCurrent();
            
            // Unique constraint
            $table->unique('snapshot_date');
        });

        // Reset search path
        DB::statement('SET search_path TO public');

        // Index
        DB::statement('CREATE INDEX idx_pipeline_metrics_date ON ops.pipeline_metrics(snapshot_date DESC)');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement('DROP TABLE IF EXISTS ops.pipeline_metrics CASCADE');
    }
};

