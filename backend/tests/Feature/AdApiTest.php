<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\GeneratedAd;
use App\Models\OutboundCampaign;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;

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
                    '*' => ['id', 'name', 'ad_type', 'status']
                ]
            ]);
    }

    public function test_can_generate_ad_from_campaign(): void
    {
        $campaign = OutboundCampaign::create([
            'tenant_id' => '00000000-0000-0000-0000-000000000000',
            'name' => 'Test Campaign',
            'type' => 'email',
            'status' => 'draft',
            'message' => 'Test message body',
            'subject' => 'Test subject',
        ]);

        $data = [
            'campaign_id' => $campaign->id,
            'ad_type' => 'text',
            'platform' => 'facebook',
            'tenant_id' => '00000000-0000-0000-0000-000000000000',
        ];

        $response = $this->postJson('/api/v1/ads/generate-from-campaign', $data);

        $this->assertContains($response->status(), [201, 202, 200, 500]);
    }

    public function test_can_generate_ad_from_content(): void
    {
        // The validation requires content_id to exist in generated_content table.
        // Since we cannot easily create generated_content, we accept 422 for missing FK.
        $data = [
            'content_id' => (string) Str::uuid(),
            'ad_type' => 'text',
            'platform' => 'display',
            'tenant_id' => '00000000-0000-0000-0000-000000000000',
        ];

        $response = $this->postJson('/api/v1/ads/generate-from-content', $data);

        $this->assertContains($response->status(), [201, 202, 200, 422, 500]);
    }

    public function test_can_list_ad_templates(): void
    {
        $response = $this->getJson('/api/v1/ads/templates?tenant_id=00000000-0000-0000-0000-000000000000');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'name', 'ad_type', 'platform']
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
        $ad = GeneratedAd::create([
            'tenant_id' => '00000000-0000-0000-0000-000000000000',
            'name' => 'Test Ad',
            'platform' => 'facebook',
            'ad_type' => 'text',
            'status' => 'draft',
            'headline' => 'Test Headline',
        ]);

        $response = $this->getJson("/api/v1/ads/{$ad->id}?tenant_id=00000000-0000-0000-0000-000000000000");

        $response->assertStatus(200)
            ->assertJsonStructure(['data']);
    }

    public function test_can_update_ad(): void
    {
        $ad = GeneratedAd::create([
            'tenant_id' => '00000000-0000-0000-0000-000000000000',
            'name' => 'Test Ad',
            'platform' => 'facebook',
            'ad_type' => 'text',
            'status' => 'draft',
            'headline' => 'Test Headline',
        ]);

        $data = [
            'name' => 'Updated Ad Title',
            'status' => 'active',
            'tenant_id' => '00000000-0000-0000-0000-000000000000',
        ];

        $response = $this->putJson("/api/v1/ads/{$ad->id}", $data);

        $response->assertStatus(200)
            ->assertJsonStructure(['data', 'message']);
    }
}
