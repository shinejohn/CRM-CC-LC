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

        Schema::create('cost_tracking', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
            
            // Time Period
            $table->date('cost_date');
            $table->string('period_type', 20); // daily, weekly, monthly
            
            // AWS Costs
            $table->decimal('cost_aws_total', 12, 2)->nullable();
            $table->decimal('cost_aws_ec2', 12, 2)->nullable();
            $table->decimal('cost_aws_rds', 12, 2)->nullable();
            $table->decimal('cost_aws_s3', 12, 2)->nullable();
            $table->decimal('cost_aws_ses', 12, 2)->nullable();
            $table->decimal('cost_aws_cloudfront', 12, 2)->nullable();
            $table->decimal('cost_aws_lambda', 12, 2)->nullable();
            $table->decimal('cost_aws_other', 12, 2)->nullable();
            
            // Email Costs
            $table->decimal('cost_email_total', 12, 2)->nullable();
            $table->decimal('cost_email_postal_infra', 12, 2)->nullable();
            $table->decimal('cost_email_ses_backup', 12, 2)->nullable();
            $table->decimal('cost_email_warmup', 12, 2)->nullable();
            $table->integer('emails_sent')->nullable();
            $table->decimal('cost_per_email', 8, 6)->nullable();
            
            // Communication Costs
            $table->decimal('cost_sms_total', 12, 2)->nullable();
            $table->integer('sms_sent')->nullable();
            $table->decimal('cost_per_sms', 6, 4)->nullable();
            
            $table->decimal('cost_voice_total', 12, 2)->nullable();
            $table->integer('voice_minutes')->nullable();
            $table->decimal('cost_per_voice_minute', 6, 4)->nullable();
            
            // AI Costs
            $table->decimal('cost_ai_total', 12, 2)->nullable();
            $table->decimal('cost_ai_anthropic', 12, 2)->nullable();
            $table->decimal('cost_ai_openai', 12, 2)->nullable();
            $table->bigInteger('ai_tokens_used')->nullable();
            $table->decimal('cost_per_1k_tokens', 6, 4)->nullable();
            
            // Third Party Services
            $table->decimal('cost_twilio', 12, 2)->nullable();
            $table->decimal('cost_stripe_fees', 12, 2)->nullable();
            $table->decimal('cost_monitoring', 12, 2)->nullable();
            $table->decimal('cost_other_services', 12, 2)->nullable();
            
            // Infrastructure
            $table->decimal('cost_domains', 12, 2)->nullable();
            $table->decimal('cost_ssl_certs', 12, 2)->nullable();
            $table->decimal('cost_ip_addresses', 12, 2)->nullable();
            
            // Totals
            $table->decimal('cost_total', 14, 2)->nullable();
            $table->decimal('cost_per_customer', 10, 2)->nullable();
            $table->decimal('cost_per_community', 10, 2)->nullable();
            
            // Comparison
            $table->decimal('cost_change_from_prior', 12, 2)->nullable();
            $table->decimal('cost_change_percentage', 5, 2)->nullable();
            
            // Budget
            $table->decimal('budget_allocated', 14, 2)->nullable();
            $table->decimal('budget_variance', 12, 2)->nullable();
            $table->decimal('budget_variance_percentage', 5, 2)->nullable();
            
            $table->timestampTz('computed_at')->useCurrent();
            
            // Unique constraint
            $table->unique(['cost_date', 'period_type'], 'cost_tracking_unique');
        });

        // Reset search path
        DB::statement('SET search_path TO public');

        // Index
        DB::statement('CREATE INDEX idx_cost_tracking_date ON ops.cost_tracking(cost_date DESC, period_type)');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement('DROP TABLE IF EXISTS ops.cost_tracking CASCADE');
    }
};

