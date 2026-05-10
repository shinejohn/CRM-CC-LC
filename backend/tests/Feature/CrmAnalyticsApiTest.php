<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

class CrmAnalyticsApiTest extends TestCase
{
    use RefreshDatabase; protected function setUp(): void { parent::setUp(); $this->createAndAuthenticateUser(); }

    public function test_can_get_interest_analytics(): void
    {
        $response = $this->getJson('/api/v1/crm/analytics/interest?start_date=2024-01-01&end_date=2024-12-31');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'interest_by_topic',
                    'questions_by_type',
                    'customer_engagement',
                    'interest_over_time',
                    'date_range',
                ]
            ]);
    }

    public function test_can_get_purchase_analytics(): void
    {
        $response = $this->getJson('/api/v1/crm/analytics/purchases?start_date=2024-01-01&end_date=2024-12-31');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'summary',
                    'purchases_by_service',
                    'customer_purchases',
                    'purchase_timeline',
                    'conversion_funnel',
                    'date_range',
                ]
            ]);
    }

    public function test_can_get_learning_analytics(): void
    {
        $response = $this->getJson('/api/v1/crm/analytics/learning?start_date=2024-01-01&end_date=2024-12-31');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'knowledge_base',
                    'presentations',
                    'engagement',
                    'customer_learning',
                    'learning_over_time',
                    'date_range',
                ]
            ]);
    }

    public function test_can_get_campaign_performance(): void
    {
        $response = $this->getJson('/api/v1/crm/analytics/campaign-performance?start_date=2024-01-01&end_date=2024-12-31');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'campaign_performance',
                    'date_range',
                ]
            ]);
    }
}
