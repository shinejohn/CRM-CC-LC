<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\OutboundCampaign;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;

class OutboundCampaignApiTest extends TestCase
{
    use RefreshDatabase; protected function setUp(): void { parent::setUp(); $this->createAndAuthenticateUser(); Queue::fake(); }

    private function createCampaign(array $overrides = []): OutboundCampaign
    {
        return OutboundCampaign::create(array_merge([
            'tenant_id' => '00000000-0000-0000-0000-000000000000',
            'name' => 'Test Campaign',
            'type' => 'email',
            'status' => 'draft',
            'message' => 'Test message body',
            'subject' => 'Test subject',
        ], $overrides));
    }

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
            'message' => 'Hello, this is a test campaign message.',
            'subject' => 'Test Subject',
            'tenant_id' => '00000000-0000-0000-0000-000000000000',
        ];

        $response = $this->postJson('/api/v1/outbound/campaigns', $data);

        $response->assertStatus(201)
            ->assertJsonStructure(['data' => ['id', 'name']]);
    }

    public function test_can_show_outbound_campaign(): void
    {
        $campaign = $this->createCampaign();

        $response = $this->getJson("/api/v1/outbound/campaigns/{$campaign->id}");

        $response->assertStatus(200)
            ->assertJsonStructure(['data']);
    }

    public function test_can_update_outbound_campaign(): void
    {
        $campaign = $this->createCampaign();

        $data = [
            'name' => 'Updated Campaign Name',
            'status' => 'scheduled',
        ];

        $response = $this->putJson("/api/v1/outbound/campaigns/{$campaign->id}", $data);

        $response->assertStatus(200)
            ->assertJsonStructure(['data', 'message']);
    }

    public function test_can_get_campaign_recipients(): void
    {
        $campaign = $this->createCampaign();

        $response = $this->getJson("/api/v1/outbound/campaigns/{$campaign->id}/recipients");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'total',
                    'recipients',
                ]
            ]);
    }

    public function test_can_start_campaign(): void
    {
        $campaign = $this->createCampaign();

        $response = $this->postJson("/api/v1/outbound/campaigns/{$campaign->id}/start", []);

        $response->assertStatus(200)
            ->assertJsonStructure(['data', 'message']);
    }

    public function test_can_get_campaign_analytics(): void
    {
        $campaign = $this->createCampaign();

        $response = $this->getJson("/api/v1/outbound/campaigns/{$campaign->id}/analytics");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'campaign_id',
                    'total_recipients',
                    'sent_count',
                    'delivered_count',
                    'opened_count',
                    'clicked_count',
                ]
            ]);
    }
}
