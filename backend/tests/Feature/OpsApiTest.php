<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class OpsApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_ops_endpoints_require_auth()
    {
        $this->getJson('/api/v1/ops/system-status')->assertStatus(401);
    }

    public function test_municipal_admin_can_access_ops_dashboard()
    {
        $admin = User::factory()->create();

        // Create a community using the factory to fulfill all required fields automatically
        $community = \App\Models\Community::factory()->create();

        // Create municipal admin record
        DB::table('municipal_admins')->insert([
            'id' => (string) \Illuminate\Support\Str::uuid(),
            'user_id' => $admin->id,
            'community_id' => $community->id,
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Insert some dummy data to avoid entirely empty JSON if tables exist
        try {
            DB::table('metric_aggregates')->insert([
                'metric_id' => '1',
                'value' => 5,
                'dimension' => 'global',
                'period_start' => now(),
                'period_end' => now(),
            ]);
        } catch (\Exception $e) {
            // Ignored if table scheme differs slightly
        }

        $endpoints = [
            '/api/v1/ops/metrics',
            '/api/v1/ops/health',
            '/api/v1/ops/queues',
            '/api/v1/ops/costs',
            '/api/v1/ops/incidents',
            '/api/v1/ops/pipeline',
            '/api/v1/ops/actions',
            '/api/v1/ops/metric-definitions',
            '/api/v1/ops/system-status',
        ];

        foreach ($endpoints as $endpoint) {
            $response = $this->actingAs($admin, 'sanctum')->getJson($endpoint);
            // Even if tables are missing, it might throw 500. We just assert 200 to verify the route and controller work.
            $response->assertStatus(200);
            $response->assertJsonStructure(['data']);
        }
    }
}
