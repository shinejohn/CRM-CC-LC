<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Add ZeroBounce email validation fields to customers table.
     */
    public function up(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            $table->string('zb_status')->nullable()->index();
            $table->string('zb_sub_status')->nullable();
            $table->timestamp('zb_checked_at')->nullable();
            $table->boolean('email_suppressed')->default(false)->index();
            $table->string('email_suppressed_reason')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            $table->dropIndex(['zb_status']);
            $table->dropIndex(['email_suppressed']);
            $table->dropColumn([
                'zb_status',
                'zb_sub_status',
                'zb_checked_at',
                'email_suppressed',
                'email_suppressed_reason',
            ]);
        });
    }
};
