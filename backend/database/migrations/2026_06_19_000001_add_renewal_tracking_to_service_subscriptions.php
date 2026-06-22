<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('service_subscriptions', function (Blueprint $table) {
            $table->integer('renewal_attempts')->default(0);
            $table->timestampTz('last_renewal_attempt_at')->nullable();
            $table->text('renewal_failure_reason')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('service_subscriptions', function (Blueprint $table) {
            $table->dropColumn([
                'renewal_attempts',
                'last_renewal_attempt_at',
                'renewal_failure_reason',
            ]);
        });
    }
};
