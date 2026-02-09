<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

class CampaignGenerationApiTest extends TestCase
{
    use RefreshDatabase; protected function setUp(): void { parent::setUp(); $this->createAndAuthenticateUser(); }

    public function test_can_generate_campaign(): void
    {
        $data = [
            'customer_id' => '00000000-0000-0000-0000-000000000000',
            'campaign_type' => 'email',
            'objectives' => ['engagement', 'sales'],
            'tenant_id' => '00000000-0000-0000-0000-000000000000',
        ];

        $response = $this->postJson('/api/v1/campaigns/generate', $data);

        // May return 201 or 202 (accepted) depending on implementation
        $this->assertContains($response->status(), [201, 202, 200]);
    }

    public function test_can_list_campaign_templates(): void
    {
        $response = $this->getJson('/api/v1/campaigns/templates');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'name', 'type', 'objectives']
                ]
            ]);
    }

    public function test_can_get_campaign_suggestions(): void
    {
        $data = [
            'customer_id' => '00000000-0000-0000-0000-000000000000',
            'context' => 'recent purchase',
        ];

        $response = $this->postJson('/api/v1/campaigns/suggestions', $data);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => ['type', 'recommendation', 'rationale']
                ]
            ]);
    }
}
