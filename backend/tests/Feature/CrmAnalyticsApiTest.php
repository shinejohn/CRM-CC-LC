<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

class CrmAnalyticsApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_get_interest_analytics(): void
    {
        $response = $this->getJson('/api/v1/crm/analytics/interest?start_date=2024-01-01&end_date=2024-12-31');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'total_interests',
                    'top_interests',
                    'trends',
                ]
            ]);
    }

    public function test_can_get_purchase_analytics(): void
    {
        $response = $this->getJson('/api/v1/crm/analytics/purchases?start_date=2024-01-01&end_date=2024-12-31');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'total_purchases',
                    'revenue',
                    'average_order_value',
                    'top_products',
                ]
            ]);
    }

    public function test_can_get_learning_analytics(): void
    {
        $response = $this->getJson('/api/v1/crm/analytics/learning?start_date=2024-01-01&end_date=2024-12-31');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'total_learning_activities',
                    'completion_rate',
                    'popular_content',
                ]
            ]);
    }

    public function test_can_get_campaign_performance(): void
    {
        $response = $this->getJson('/api/v1/crm/analytics/campaign-performance?start_date=2024-01-01&end_date=2024-12-31');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'total_campaigns',
                    'performance_metrics',
                    'top_campaigns',
                ]
            ]);
    }
}
