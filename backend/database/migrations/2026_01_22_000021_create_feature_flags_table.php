<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (DB::getDriverName() !== 'pgsql') {
            return;
        }

        // Set search path to ops schema for table creation
        DB::statement('SET search_path TO ops, public');

        Schema::create('feature_flags', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
            
            // Identity
            $table->string('flag_key', 100)->unique();
            $table->string('name', 255);
            $table->text('description')->nullable();
            
            // Status
            $table->boolean('is_enabled')->default(false);
            
            // Targeting
            $table->integer('rollout_percentage')->default(0); // 0-100
            
            // Variants
            if (DB::getDriverName() === 'pgsql') {
                $table->jsonb('variants')->nullable();
            } else {
                $table->json('variants')->nullable();
            }
            $table->string('default_variant', 50)->nullable();
            
            // Schedule
            $table->timestampTz('enabled_at')->nullable();
            $table->timestampTz('disabled_at')->nullable();
            
            // Metadata
            $table->string('owner', 100)->nullable();
            
            $table->timestampTz('created_at')->useCurrent();
            $table->timestampTz('updated_at')->useCurrent()->useCurrentOnUpdate();
        });

        // Reset search path
        DB::statement('SET search_path TO public');

        // Add PostgreSQL UUID[] and TEXT[] arrays after table creation
        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE ops.feature_flags ADD COLUMN target_communities UUID[]');
            DB::statement('ALTER TABLE ops.feature_flags ADD COLUMN target_customer_tiers TEXT[]');
            DB::statement('ALTER TABLE ops.feature_flags ADD COLUMN target_users TEXT[]');
            DB::statement('ALTER TABLE ops.feature_flags ADD COLUMN tags TEXT[]');
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement('DROP TABLE IF EXISTS ops.feature_flags CASCADE');
    }
};

