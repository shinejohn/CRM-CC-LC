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

        Schema::create('revenue_snapshots', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
            
            // Time Period
            $table->date('snapshot_date');
            $table->string('snapshot_type', 20); // daily, weekly, monthly
            
            // Core Revenue Metrics
            $table->decimal('mrr', 12, 2);
            $table->decimal('arr', 14, 2)->nullable();
            
            // Revenue Breakdown
            $table->decimal('revenue_b2b', 12, 2)->nullable();
            $table->decimal('revenue_b2c', 12, 2)->nullable();
            $table->decimal('revenue_advertising', 12, 2)->nullable();
            $table->decimal('revenue_events', 12, 2)->nullable();
            $table->decimal('revenue_services', 12, 2)->nullable();
            $table->decimal('revenue_other', 12, 2)->nullable();
            
            // By Tier
            $table->decimal('revenue_tier_free', 12, 2)->nullable();
            $table->decimal('revenue_tier_basic', 12, 2)->nullable();
            $table->decimal('revenue_tier_community_influencer', 12, 2)->nullable();
            $table->decimal('revenue_tier_premium', 12, 2)->nullable();
            $table->decimal('revenue_tier_enterprise', 12, 2)->nullable();
            
            // Growth Metrics
            $table->decimal('new_mrr', 12, 2)->nullable();
            $table->decimal('expansion_mrr', 12, 2)->nullable();
            $table->decimal('contraction_mrr', 12, 2)->nullable();
            $table->decimal('churned_mrr', 12, 2)->nullable();
            $table->decimal('net_new_mrr', 12, 2)->nullable();
            
            // Customer Metrics
            $table->integer('total_paying_customers')->nullable();
            $table->integer('new_customers')->nullable();
            $table->integer('churned_customers')->nullable();
            $table->integer('net_new_customers')->nullable();
            
            // Unit Economics
            $table->decimal('arpu', 10, 2)->nullable();
            $table->decimal('ltv', 10, 2)->nullable();
            $table->decimal('cac', 10, 2)->nullable();
            $table->decimal('ltv_cac_ratio', 5, 2)->nullable();
            
            // Community Metrics
            $table->integer('communities_active')->nullable();
            $table->integer('communities_revenue_generating')->nullable();
            $table->decimal('avg_revenue_per_community', 10, 2)->nullable();
            
            // Metadata
            $table->timestampTz('computed_at')->useCurrent();
            
            // Unique constraint
            $table->unique(['snapshot_date', 'snapshot_type'], 'revenue_snapshots_unique');
        });

        // Reset search path
        DB::statement('SET search_path TO public');

        // Index
        DB::statement('CREATE INDEX idx_revenue_snapshots_date ON ops.revenue_snapshots(snapshot_date DESC, snapshot_type)');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement('DROP TABLE IF EXISTS ops.revenue_snapshots CASCADE');
    }
};

