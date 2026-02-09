<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

class EmailCampaignApiTest extends TestCase
{
    use RefreshDatabase; protected function setUp(): void { parent::setUp(); $this->createAndAuthenticateUser(); }

    public function test_can_list_email_campaigns(): void
    {
        $response = $this->getJson('/api/v1/outbound/email/campaigns');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'subject', 'status', 'sent_count']
                ]
            ]);
    }

    public function test_can_create_email_campaign(): void
    {
        $data = [
            'subject' => 'Test Email Campaign',
            'body' => 'Test email body',
            'recipients' => ['test@example.com'],
            'tenant_id' => '00000000-0000-0000-0000-000000000000',
        ];

        $response = $this->postJson('/api/v1/outbound/email/campaigns', $data);

        $response->assertStatus(201)
            ->assertJsonStructure(['data' => ['id', 'subject']]);
    }

    public function test_can_list_email_templates(): void
    {
        $response = $this->getJson('/api/v1/outbound/email/templates');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'name', 'subject']
                ]
            ]);
    }

    public function test_can_create_email_template(): void
    {
        $data = [
            'name' => 'Test Email Template',
            'subject' => 'Test Subject',
            'body' => 'Test body',
            'tenant_id' => '00000000-0000-0000-0000-000000000000',
        ];

        $response = $this->postJson('/api/v1/outbound/email/templates', $data);

        $response->assertStatus(201)
            ->assertJsonStructure(['data' => ['id', 'name']]);
    }
}
