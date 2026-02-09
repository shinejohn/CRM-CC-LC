<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Customer;
use Illuminate\Foundation\Testing\RefreshDatabase;

class CrmAdvancedAnalyticsApiTest extends TestCase
{
    use RefreshDatabase; protected function setUp(): void { parent::setUp(); $this->createAndAuthenticateUser(); }

    public function test_can_get_customer_engagement_score(): void
    {
        $customer = Customer::factory()->create();

        $response = $this->getJson("/api/v1/crm/customers/{$customer->id}/engagement-score");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'customer_id',
                    'engagement_score',
                    'factors',
                    'trend',
                ]
            ]);
    }

    public function test_can_get_campaign_roi(): void
    {
        $campaignId = 'test-campaign-id';

        $response = $this->getJson("/api/v1/crm/campaigns/{$campaignId}/roi");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'campaign_id',
                    'roi',
                    'revenue',
                    'cost',
                    'conversion_rate',
                ]
            ]);
    }

    public function test_can_get_predictive_score(): void
    {
        $customer = Customer::factory()->create();

        $response = $this->getJson("/api/v1/crm/customers/{$customer->id}/predictive-score");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'customer_id',
                    'predictive_score',
                    'factors',
                    'recommendations',
                ]
            ]);
    }
}
