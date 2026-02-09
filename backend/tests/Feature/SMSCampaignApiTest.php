<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

class SMSCampaignApiTest extends TestCase
{
    use RefreshDatabase; protected function setUp(): void { parent::setUp(); $this->createAndAuthenticateUser(); }

    public function test_can_list_sms_campaigns(): void
    {
        $response = $this->getJson('/api/v1/outbound/sms/campaigns');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'name', 'status', 'sent_count']
                ]
            ]);
    }

    public function test_can_create_sms_campaign(): void
    {
        $data = [
            'name' => 'Test SMS Campaign',
            'message' => 'Test SMS message',
            'recipients' => ['+1234567890'],
            'tenant_id' => '00000000-0000-0000-0000-000000000000',
        ];

        $response = $this->postJson('/api/v1/outbound/sms/campaigns', $data);

        $response->assertStatus(201)
            ->assertJsonStructure(['data' => ['id', 'name']]);
    }

    public function test_can_list_sms_templates(): void
    {
        $response = $this->getJson('/api/v1/outbound/sms/templates');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'name', 'message']
                ]
            ]);
    }

    public function test_can_create_sms_template(): void
    {
        $data = [
            'name' => 'Test SMS Template',
            'message' => 'Test template message',
            'tenant_id' => '00000000-0000-0000-0000-000000000000',
        ];

        $response = $this->postJson('/api/v1/outbound/sms/templates', $data);

        $response->assertStatus(201)
            ->assertJsonStructure(['data' => ['id', 'name']]);
    }

    public function test_can_update_sms_status(): void
    {
        $campaignId = 'test-campaign-id';

        $data = [
            'sms_id' => 'test-sms-id',
            'status' => 'delivered',
        ];

        $response = $this->postJson("/api/v1/outbound/sms/campaigns/{$campaignId}/sms-status", $data);

        $response->assertStatus(200)
            ->assertJsonStructure(['data', 'message']);
    }
}
