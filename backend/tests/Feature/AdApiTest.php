<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

class AdApiTest extends TestCase
{
    use RefreshDatabase;
    protected function setUp(): void
    {
        parent::setUp();
        $this->createAndAuthenticateUser();
    }

    public function test_can_list_ads(): void
    {
        $response = $this->getJson('/api/v1/ads?tenant_id=00000000-0000-0000-0000-000000000000');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'title', 'type', 'status']
                ]
            ]);
    }

    public function test_can_generate_ad_from_campaign(): void
    {
        $data = [
            'campaign_id' => 'test-campaign-id',
            'ad_type' => 'social',
            'platform' => 'facebook',
            'tenant_id' => '00000000-0000-0000-0000-000000000000',
        ];

        $response = $this->postJson('/api/v1/ads/generate-from-campaign', $data);

        $this->assertContains($response->status(), [201, 202, 200]);
    }

    public function test_can_generate_ad_from_content(): void
    {
        $data = [
            'content_id' => 'test-content-id',
            'ad_type' => 'display',
            'tenant_id' => '00000000-0000-0000-0000-000000000000',
        ];

        $response = $this->postJson('/api/v1/ads/generate-from-content', $data);

        $this->assertContains($response->status(), [201, 202, 200]);
    }

    public function test_can_list_ad_templates(): void
    {
        $response = $this->getJson('/api/v1/ads/templates?tenant_id=00000000-0000-0000-0000-000000000000');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'name', 'type', 'platform']
                ]
            ]);
    }

    public function test_can_create_ad_template(): void
    {
        $data = [
            'name' => 'Test Ad Template',
            'ad_type' => 'image',
            'platform' => 'facebook',
            'template' => 'Test template',
            'tenant_id' => '00000000-0000-0000-0000-000000000000',
        ];

        $response = $this->postJson('/api/v1/ads/templates', $data);

        $response->assertStatus(201)
            ->assertJsonStructure(['data' => ['id', 'name']]);
    }

    public function test_can_show_ad(): void
    {
        $adId = 'test-ad-id';

        $response = $this->getJson("/api/v1/ads/{$adId}?tenant_id=00000000-0000-0000-0000-000000000000");

        $response->assertStatus(200)
            ->assertJsonStructure(['data']);
    }

    public function test_can_update_ad(): void
    {
        $adId = 'test-ad-id';

        $data = [
            'title' => 'Updated Ad Title',
            'status' => 'active',
            'tenant_id' => '00000000-0000-0000-0000-000000000000',
        ];

        $response = $this->putJson("/api/v1/ads/{$adId}", $data);

        $response->assertStatus(200)
            ->assertJsonStructure(['data', 'message']);
    }
}
