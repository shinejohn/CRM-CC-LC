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

        Schema::create('infrastructure_components', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::getDriverName() === 'pgsql' ? DB::raw('gen_random_uuid()') : null);
            
            // Identity
            $table->string('component_key', 100)->unique();
            $table->string('name', 255);
            $table->text('description')->nullable();
            
            // Classification
            $table->string('component_type', 50); // server, database, cache, queue, email_ip, service, external_api
            $table->string('category', 50); // compute, storage, networking, email, third_party
            $table->string('environment', 20)->default('production'); // production, staging, development
            
            // Location & Connection
            $table->string('host', 255)->nullable();
            $table->integer('port')->nullable();
            $table->text('connection_string_encrypted')->nullable();
            
            // Health Check Configuration
            $table->string('health_check_type', 50)->nullable(); // http, tcp, ping, custom
            $table->string('health_check_endpoint', 255)->nullable();
            $table->integer('health_check_interval_seconds')->default(60);
            $table->integer('health_check_timeout_seconds')->default(10);
            
            // Thresholds
            $table->integer('warning_response_time_ms')->nullable();
            $table->integer('critical_response_time_ms')->nullable();
            
            // Dependencies (UUID array in PostgreSQL)
            if (DB::getDriverName() === 'pgsql') {
                $table->jsonb('depends_on')->nullable();
            } else {
                $table->json('depends_on')->nullable();
            }
            
            // Status
            $table->string('current_status', 20)->default('unknown'); // healthy, degraded, unhealthy, unknown
            $table->timestampTz('last_status_change')->nullable();
            $table->boolean('is_active')->default(true);
            
            // Metadata
            if (DB::getDriverName() === 'pgsql') {
                $table->jsonb('tags')->default(DB::raw("'[]'::jsonb"));
                $table->jsonb('metadata')->nullable();
            } else {
                $table->json('tags')->default('[]');
                $table->json('metadata')->nullable();
            }
            
            $table->timestampTz('created_at')->useCurrent();
            $table->timestampTz('updated_at')->useCurrent()->useCurrentOnUpdate();
        });

        // Reset search path
        DB::statement('SET search_path TO public');

        // Indexes
        DB::statement('CREATE INDEX idx_infra_components_type ON ops.infrastructure_components(component_type, category)');
        DB::statement('CREATE INDEX idx_infra_components_status ON ops.infrastructure_components(current_status) WHERE is_active = TRUE');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement('DROP TABLE IF EXISTS ops.infrastructure_components CASCADE');
    }
};

