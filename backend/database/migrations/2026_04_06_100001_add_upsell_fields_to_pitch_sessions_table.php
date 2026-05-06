<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pitch_sessions', function (Blueprint $table) {
            // Columns missing from original migration that are in the model's $fillable
            $table->timestampTz('pitch_completed_at')->nullable()->after('abandoned_at');
            $table->string('business_name')->nullable()->after('pitch_completed_at');
            $table->string('business_category')->nullable()->after('business_name');

            // New upsell context columns
            $table->string('flow_mode')->default('pitch')->after('business_category');

            if (DB::getDriverName() === 'pgsql') {
                $table->jsonb('existing_products')->nullable()->after('flow_mode');
                $table->jsonb('upsell_rationale')->nullable()->after('existing_products');
            } else {
                $table->json('existing_products')->nullable()->after('flow_mode');
                $table->json('upsell_rationale')->nullable()->after('existing_products');
            }

            $table->decimal('existing_monthly_value', 10, 2)->nullable()->after('upsell_rationale');

            $table->index('flow_mode');
        });
    }

    public function down(): void
    {
        Schema::table('pitch_sessions', function (Blueprint $table) {
            $table->dropIndex(['flow_mode']);

            $table->dropColumn([
                'pitch_completed_at',
                'business_name',
                'business_category',
                'flow_mode',
                'existing_products',
                'upsell_rationale',
                'existing_monthly_value',
            ]);
        });
    }
};
