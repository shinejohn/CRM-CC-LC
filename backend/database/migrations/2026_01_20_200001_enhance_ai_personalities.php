<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('ai_personalities', function (Blueprint $table) {
            // Dedicated communication channels (if not already exist)
            if (!Schema::hasColumn('ai_personalities', 'dedicated_phone')) {
                $table->string('dedicated_phone')->nullable()->after('contact_phone');
            }
            if (!Schema::hasColumn('ai_personalities', 'dedicated_email')) {
                $table->string('dedicated_email')->nullable()->after('contact_email');
            }
            if (!Schema::hasColumn('ai_personalities', 'dedicated_sms')) {
                $table->string('dedicated_sms')->nullable()->after('dedicated_email');
            }
            if (!Schema::hasColumn('ai_personalities', 'voicemail_greeting_url')) {
                $table->string('voicemail_greeting_url')->nullable()->after('dedicated_sms');
            }

            // Industry specialization
            if (!Schema::hasColumn('ai_personalities', 'industry_specializations')) {
                $table->json('industry_specializations')->nullable()->after('voicemail_greeting_url');
            }
            if (!Schema::hasColumn('ai_personalities', 'industry_match_weight')) {
                $table->integer('industry_match_weight')->default(10)->after('industry_specializations');
            }

            // Personality traits for AI generation (may already exist as 'traits')
            if (!Schema::hasColumn('ai_personalities', 'personality_traits')) {
                $table->json('personality_traits')->nullable()->after('industry_match_weight');
            }
            if (!Schema::hasColumn('ai_personalities', 'system_prompt_override')) {
                $table->text('system_prompt_override')->nullable()->after('personality_traits');
            }

            // Availability & capacity
            if (!Schema::hasColumn('ai_personalities', 'max_active_customers')) {
                $table->integer('max_active_customers')->default(100)->after('system_prompt_override');
            }
            if (!Schema::hasColumn('ai_personalities', 'current_customer_count')) {
                $table->integer('current_customer_count')->default(0)->after('max_active_customers');
            }
            // is_available already exists, but we'll add index if needed

            // Performance metrics
            if (!Schema::hasColumn('ai_personalities', 'avg_response_time_hours')) {
                $table->decimal('avg_response_time_hours', 5, 2)->nullable()->after('current_customer_count');
            }
            if (!Schema::hasColumn('ai_personalities', 'customer_satisfaction_score')) {
                $table->decimal('customer_satisfaction_score', 3, 2)->nullable()->after('avg_response_time_hours');
            }
            if (!Schema::hasColumn('ai_personalities', 'total_interactions')) {
                $table->integer('total_interactions')->default(0)->after('customer_satisfaction_score');
            }
            if (!Schema::hasColumn('ai_personalities', 'successful_conversions')) {
                $table->integer('successful_conversions')->default(0)->after('total_interactions');
            }

            // Add indexes if they don't exist
            if (!Schema::hasColumn('ai_personalities', 'is_available')) {
                $table->boolean('is_available')->default(true)->after('current_customer_count');
            }

            // Add index safely
            try {
                $table->index('dedicated_phone');
            } catch (\Exception $e) {
            }

            try {
                $table->index('dedicated_email');
            } catch (\Exception $e) {
            }
        });
    }

    public function down(): void
    {
        Schema::table('ai_personalities', function (Blueprint $table) {
            $columns = [
                'dedicated_phone',
                'dedicated_email',
                'dedicated_sms',
                'voicemail_greeting_url',
                'industry_specializations',
                'industry_match_weight',
                'personality_traits',
                'system_prompt_override',
                'max_active_customers',
                'current_customer_count',
                'avg_response_time_hours',
                'customer_satisfaction_score',
                'total_interactions',
                'successful_conversions',
            ];

            foreach ($columns as $column) {
                if (Schema::hasColumn('ai_personalities', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};

