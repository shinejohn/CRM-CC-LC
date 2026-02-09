<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sponsorships', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique()->default(DB::getDriverName() === 'pgsql' ? DB::raw('gen_random_uuid()') : null);
            $table->foreignId('sponsor_id')->constrained('sponsors')->onDelete('cascade');
            
            // Scope
            $table->string('sponsorship_type', 50)->comment('newsletter_header, newsletter_section, alert_sponsor');
            $table->foreignId('community_id')->nullable()->constrained('communities')->onDelete('cascade')->comment('NULL = all communities');
            
            // Campaign dates
            $table->date('start_date');
            $table->date('end_date');
            
            // Inventory
            $table->integer('impressions_purchased');
            $table->integer('impressions_delivered')->default(0);
            
            // Creative
            if (DB::getDriverName() === 'pgsql') {
                $table->jsonb('creative_json')->nullable()->comment('Ad content: headline, image, cta, etc.');
            } else {
                $table->json('creative_json')->nullable();
            }
            
            // Pricing
            $table->string('rate_type', 20)->comment('cpm, flat, cpc');
            $table->integer('rate_cents')->comment('CPM rate or flat fee');
            $table->integer('total_value_cents')->comment('Total contract value');
            
            // Status
            $table->string('status', 20)->default('pending')->comment('pending, active, paused, completed, cancelled');
            
            // Performance (denormalized)
            $table->integer('click_count')->default(0);
            
            $table->timestamps();
        });
        
        Schema::table('sponsorships', function (Blueprint $table) {
            $table->index(['start_date', 'end_date', 'status'], 'idx_sponsorships_active')
                ->where('status', '=', 'active');
            $table->index('sponsor_id', 'idx_sponsorships_sponsor');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sponsorships');
    }
};



