<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('customers', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id'); // Multi-tenant support

            // Identifiers
            $table->string('slug', 100)->unique();
            $table->string('external_id', 100)->nullable(); // ID from external CRM

            // Basic info
            $table->string('business_name');
            $table->string('owner_name')->nullable();
            $table->string('industry_id', 50)->nullable(); // References industries table
            $table->string('sub_category', 100)->nullable(); // "pizza", "fine-dining", etc.

            // Contact
            $table->string('phone', 20)->nullable();
            $table->string('email')->nullable();
            $table->string('website')->nullable();

            // Location
            $table->string('address_line1')->nullable();
            $table->string('address_line2')->nullable();
            $table->string('city', 100)->nullable();
            $table->string('state', 50)->nullable();
            $table->string('zip', 20)->nullable();
            $table->string('country', 50)->default('US');
            $table->string('timezone', 50)->nullable();

            // Known data (confirmed information)
            $table->json('hours')->nullable(); // Operating hours
            $table->json('services')->nullable(); // Services offered
            $table->json('social_media')->nullable(); // Social media links
            $table->string('pos_system', 100)->nullable();
            $table->json('current_integrations')->nullable(); // Array of integration names

            // Ratings
            $table->decimal('google_rating', 2, 1)->nullable();
            $table->integer('google_review_count')->nullable();
            $table->decimal('yelp_rating', 2, 1)->nullable();
            $table->integer('yelp_review_count')->nullable();

            // Business intelligence
            $table->integer('established_year')->nullable();
            $table->integer('employee_count')->nullable();
            $table->string('annual_revenue_range', 50)->nullable(); // "<100K", "100K-500K", etc.
            $table->json('challenges')->nullable(); // Array
            $table->json('goals')->nullable(); // Array
            $table->json('competitors')->nullable(); // Array
            $table->json('unique_selling_points')->nullable(); // Array

            // Unknown data (to be discovered by AI)
            $table->json('unknown_fields')->default('{}');

            // Fibonacco relationship
            $table->string('lead_source', 100)->nullable();
            $table->integer('lead_score')->default(0);
            $table->string('subscription_tier', 50)->nullable();
            $table->timestamp('first_contact_at')->nullable();
            $table->timestamp('onboarded_at')->nullable();
            $table->string('assigned_rep', 100)->nullable();
            $table->text('notes')->nullable();
            $table->json('tags')->nullable(); // Array

            // AI-First CRM fields (from AI_FIRST_SCHEMA_MIGRATION.sql)
            $table->string('industry_category')->nullable();
            $table->string('industry_subcategory')->nullable();
            $table->text('business_description')->nullable();
            $table->json('products_services')->nullable();
            $table->json('target_audience')->nullable();
            $table->json('business_hours')->nullable();
            $table->string('service_area')->nullable();
            $table->json('brand_voice')->nullable();
            $table->json('content_preferences')->nullable();
            $table->json('contact_preferences')->nullable();

            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();
            $table->softDeletes();

            // Indexes
            $table->index('tenant_id');
            $table->index('slug');
            $table->index('email');
            $table->index(['tenant_id', 'industry_category', 'industry_subcategory']);
            $table->index('lead_score');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('customers');
    }
};
