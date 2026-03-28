<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('services', function (Blueprint $table) {
            $table->string('product_slug')->unique()->nullable()->after('slug');
            $table->string('sold_by')->default('emma')->after('service_type');
            $table->json('requires_products')->nullable()->after('capabilities');
            $table->json('platform_surfaces')->nullable()->after('requires_products');
            $table->boolean('is_perk')->default(false)->after('is_featured');
            $table->string('billing_unit')->nullable()->after('billing_period');
            $table->decimal('commission_rate', 5, 2)->nullable()->after('billing_unit');
            $table->integer('max_per_community')->nullable()->after('commission_rate');
        });
    }

    public function down(): void
    {
        Schema::table('services', function (Blueprint $table) {
            $table->dropColumn([
                'product_slug',
                'sold_by',
                'requires_products',
                'platform_surfaces',
                'is_perk',
                'billing_unit',
                'commission_rate',
                'max_per_community',
            ]);
        });
    }
};
