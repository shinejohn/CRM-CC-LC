<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

class CrmDashboardApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_get_dashboard_analytics(): void
    {
        $response = $this->getJson('/api/v1/crm/dashboard/analytics');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'total_customers',
                    'active_campaigns',
                    'revenue',
                    'engagement_metrics',
                ]
            ]);
    }
}
