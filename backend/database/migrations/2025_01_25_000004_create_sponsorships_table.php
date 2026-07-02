<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('sponsorships');
        Schema::create('sponsorships', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('uuid')->unique()->default(DB::getDriverName() === 'pgsql' ? DB::raw('gen_random_uuid()') : null);
            if (Schema::hasTable('communities')) {
                $table->foreignUuid('community_id')->nullable()->constrained('communities')->onDelete('cascade')->comment('NULL = all communities');
            } else {
                $table->foreignUuid('community_id')->nullable();
            }

            // Sponsor relationship
            if (Schema::hasTable('sponsors')) {
                $table->foreignUuid('sponsor_id')->nullable()->constrained('sponsors')->onDelete('cascade');
            } else {
                $table->uuid('sponsor_id')->nullable();
            }

            // Placement / pricing
            $table->string('sponsorship_type', 50)->nullable()->comment('newsletter_header, newsletter_section, alert_sponsor');
            $table->integer('impressions_purchased')->default(0);
            $table->integer('impressions_delivered')->default(0);
            if (DB::getDriverName() === 'pgsql') {
                $table->jsonb('creative_json')->nullable();
            } else {
                $table->json('creative_json')->nullable();
            }
            $table->string('rate_type', 20)->nullable()->comment('cpm, flat, cpc');
            $table->integer('rate_cents')->default(0);
            $table->integer('total_value_cents')->default(0);
            $table->integer('click_count')->default(0);

            // Client/Advertiser
            $table->string('advertiser_name', 255);
            $table->string('advertiser_url', 255)->nullable();
            $table->string('logo_path', 255)->nullable();
            
            // Campaign details
            $table->string('campaign_name', 255);
            $table->date('start_date');
            $table->date('end_date')->nullable();
            
            // Creative
            $table->text('display_copy')->nullable();
            $table->string('cta_text', 50)->nullable();
            
            // Budget/Status
            $table->integer('total_budget_cents')->default(0);
            $table->string('status', 20)->default('active')->comment('active, paused, completed, cancelled');
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sponsorships');
    }
};
