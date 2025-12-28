<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

class OutboundCampaignApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_list_outbound_campaigns(): void
    {
        $response = $this->getJson('/api/v1/outbound/campaigns');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'name', 'status', 'type']
                ]
            ]);
    }

    public function test_can_create_outbound_campaign(): void
    {
        $data = [
            'name' => 'Test Campaign',
            'type' => 'email',
            'template_id' => 'test-template-id',
            'tenant_id' => '00000000-0000-0000-0000-000000000000',
        ];

        $response = $this->postJson('/api/v1/outbound/campaigns', $data);

        $response->assertStatus(201)
            ->assertJsonStructure(['data' => ['id', 'name']]);
    }

    public function test_can_show_outbound_campaign(): void
    {
        $campaignId = 'test-campaign-id';

        $response = $this->getJson("/api/v1/outbound/campaigns/{$campaignId}");

        $response->assertStatus(200)
            ->assertJsonStructure(['data']);
    }

    public function test_can_update_outbound_campaign(): void
    {
        $campaignId = 'test-campaign-id';

        $data = [
            'name' => 'Updated Campaign Name',
            'status' => 'active',
        ];

        $response = $this->putJson("/api/v1/outbound/campaigns/{$campaignId}", $data);

        $response->assertStatus(200)
            ->assertJsonStructure(['data', 'message']);
    }

    public function test_can_get_campaign_recipients(): void
    {
        $campaignId = 'test-campaign-id';

        $response = $this->getJson("/api/v1/outbound/campaigns/{$campaignId}/recipients");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'email', 'status']
                ]
            ]);
    }

    public function test_can_start_campaign(): void
    {
        $campaignId = 'test-campaign-id';

        $response = $this->postJson("/api/v1/outbound/campaigns/{$campaignId}/start", []);

        $response->assertStatus(200)
            ->assertJsonStructure(['data', 'message']);
    }

    public function test_can_get_campaign_analytics(): void
    {
        $campaignId = 'test-campaign-id';

        $response = $this->getJson("/api/v1/outbound/campaigns/{$campaignId}/analytics");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'sent',
                    'delivered',
                    'opened',
                    'clicked',
                    'bounced',
                ]
            ]);
    }
}
