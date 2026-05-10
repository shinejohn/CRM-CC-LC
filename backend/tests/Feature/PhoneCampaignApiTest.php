<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

class PhoneCampaignApiTest extends TestCase
{
    use RefreshDatabase; protected function setUp(): void { parent::setUp(); $this->createAndAuthenticateUser(); }

    public function test_can_list_phone_campaigns(): void
    {
        $response = $this->getJson('/api/v1/outbound/phone/campaigns');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'name', 'status', 'call_count']
                ]
            ]);
    }

    public function test_can_create_phone_campaign(): void
    {
        $data = [
            'name' => 'Test Phone Campaign',
            'type' => 'phone',
            'message' => 'Test phone campaign message',
            'tenant_id' => '00000000-0000-0000-0000-000000000000',
        ];

        $response = $this->postJson('/api/v1/outbound/phone/campaigns', $data);

        $response->assertStatus(201)
            ->assertJsonStructure(['data' => ['id', 'name']]);
    }

    public function test_can_list_phone_scripts(): void
    {
        $response = $this->getJson('/api/v1/outbound/phone/scripts');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'name', 'content']
                ]
            ]);
    }

    public function test_can_create_phone_script(): void
    {
        $data = [
            'name' => 'Test Phone Script',
            'script' => 'Test script content',
            'tenant_id' => '00000000-0000-0000-0000-000000000000',
        ];

        $response = $this->postJson('/api/v1/outbound/phone/scripts', $data);

        $response->assertStatus(201)
            ->assertJsonStructure(['data' => ['id', 'name']]);
    }

    public function test_can_update_call_status(): void
    {
        $campaignId = 'test-campaign-id';

        $data = [
            'CallSid' => 'test-call-sid',
            'CallStatus' => 'completed',
            'CallDuration' => 120,
        ];

        $response = $this->postJson("/api/v1/outbound/phone/campaigns/{$campaignId}/call-status", $data);

        $response->assertStatus(200)
            ->assertJsonStructure(['status']);
    }
}
