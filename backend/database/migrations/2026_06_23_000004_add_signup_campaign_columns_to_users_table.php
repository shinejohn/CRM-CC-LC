<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Lightweight signup attribution: which campaign (slug) a user signed up
     * through and where the lead originated.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (! Schema::hasColumn('users', 'signup_campaign')) {
                $table->string('signup_campaign')->nullable()->after('email');
            }
            if (! Schema::hasColumn('users', 'lead_source')) {
                $table->string('lead_source')->nullable()->after('signup_campaign');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['signup_campaign', 'lead_source']);
        });
    }
};
