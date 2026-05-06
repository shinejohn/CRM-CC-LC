<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('campaigns', function (Blueprint $table) {
            // Ownership
            $table->uuid('customer_id')->nullable()->after('id');
            $table->uuid('smb_id')->nullable()->after('customer_id');
            $table->uuid('community_id')->nullable()->after('smb_id');

            // Sarah campaign fields
            $table->string('name')->nullable()->after('community_id');
            $table->string('goal')->nullable()->after('name');
            $table->string('timeline')->nullable()->after('goal');
            $table->string('status')->default('draft')->after('timeline');
            $table->decimal('total_amount', 10, 2)->nullable()->after('status');
            $table->string('stripe_payment_intent_id')->nullable()->after('total_amount');
            $table->jsonb('sarah_context')->nullable()->after('stripe_payment_intent_id');
        });
    }

    public function down(): void
    {
        Schema::table('campaigns', function (Blueprint $table) {
            $table->dropColumn([
                'customer_id',
                'smb_id',
                'community_id',
                'name',
                'goal',
                'timeline',
                'status',
                'total_amount',
                'stripe_payment_intent_id',
                'sarah_context',
            ]);
        });
    }
};
