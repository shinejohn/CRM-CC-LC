<?php

namespace Database\Seeders\Operations;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class InfrastructureComponentsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        if (DB::getDriverName() !== 'pgsql') {
            $this->command->warn('Infrastructure components seeder requires PostgreSQL. Skipping...');
            return;
        }

        $components = [
            [
                'id' => DB::raw('gen_random_uuid()'),
                'component_key' => 'db.primary',
                'name' => 'Primary Database (RDS)',
                'description' => 'Main PostgreSQL database cluster',
                'component_type' => 'database',
                'category' => 'storage',
                'environment' => 'production',
                'health_check_type' => 'tcp',
                'health_check_interval_seconds' => 60,
                'health_check_timeout_seconds' => 10,
                'warning_response_time_ms' => 100,
                'critical_response_time_ms' => 500,
                'depends_on' => json_encode([]),
                'current_status' => 'unknown',
                'is_active' => true,
                'tags' => json_encode(['database', 'postgresql', 'critical']),
            ],
            [
                'id' => DB::raw('gen_random_uuid()'),
                'component_key' => 'cache.redis',
                'name' => 'Redis Cache',
                'description' => 'Redis cache cluster',
                'component_type' => 'cache',
                'category' => 'storage',
                'environment' => 'production',
                'health_check_type' => 'tcp',
                'health_check_interval_seconds' => 60,
                'health_check_timeout_seconds' => 10,
                'warning_response_time_ms' => 50,
                'critical_response_time_ms' => 200,
                'depends_on' => json_encode([]),
                'current_status' => 'unknown',
                'is_active' => true,
                'tags' => json_encode(['cache', 'redis']),
            ],
            [
                'id' => DB::raw('gen_random_uuid()'),
                'component_key' => 'email.postal',
                'name' => 'Postal Email Server',
                'description' => 'Primary email delivery server',
                'component_type' => 'email_ip',
                'category' => 'email',
                'environment' => 'production',
                'health_check_type' => 'http',
                'health_check_endpoint' => '/health',
                'health_check_interval_seconds' => 60,
                'health_check_timeout_seconds' => 10,
                'warning_response_time_ms' => 200,
                'critical_response_time_ms' => 1000,
                'depends_on' => json_encode([]),
                'current_status' => 'unknown',
                'is_active' => true,
                'tags' => json_encode(['email', 'postal', 'critical']),
            ],
            [
                'id' => DB::raw('gen_random_uuid()'),
                'component_key' => 'email.ses',
                'name' => 'AWS SES',
                'description' => 'AWS Simple Email Service backup',
                'component_type' => 'email_ip',
                'category' => 'email',
                'environment' => 'production',
                'health_check_type' => 'http',
                'health_check_endpoint' => '/health',
                'health_check_interval_seconds' => 300,
                'health_check_timeout_seconds' => 10,
                'depends_on' => json_encode([]),
                'current_status' => 'unknown',
                'is_active' => true,
                'tags' => json_encode(['email', 'ses', 'backup']),
            ],
            [
                'id' => DB::raw('gen_random_uuid()'),
                'component_key' => 'queue.workers',
                'name' => 'Queue Workers',
                'description' => 'Background job processing workers',
                'component_type' => 'queue',
                'category' => 'compute',
                'environment' => 'production',
                'health_check_type' => 'custom',
                'health_check_interval_seconds' => 60,
                'health_check_timeout_seconds' => 10,
                'depends_on' => json_encode([]),
                'current_status' => 'unknown',
                'is_active' => true,
                'tags' => json_encode(['queue', 'workers', 'jobs']),
            ],
            [
                'id' => DB::raw('gen_random_uuid()'),
                'component_key' => 'app.ecs',
                'name' => 'Application Servers (ECS)',
                'description' => 'ECS Fargate application containers',
                'component_type' => 'server',
                'category' => 'compute',
                'environment' => 'production',
                'health_check_type' => 'http',
                'health_check_endpoint' => '/health',
                'health_check_interval_seconds' => 30,
                'health_check_timeout_seconds' => 5,
                'warning_response_time_ms' => 200,
                'critical_response_time_ms' => 1000,
                'depends_on' => json_encode([]),
                'current_status' => 'unknown',
                'is_active' => true,
                'tags' => json_encode(['application', 'ecs', 'critical']),
            ],
        ];

        foreach ($components as $component) {
            // Check if component already exists
            $exists = DB::table('ops.infrastructure_components')
                ->where('component_key', $component['component_key'])
                ->exists();

            if (!$exists) {
                DB::table('ops.infrastructure_components')->insert($component);
            }
        }

        $this->command->info('Infrastructure components seeded successfully.');
    }
}

