<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

class ContentGenerationApiTest extends TestCase
{
    use RefreshDatabase; protected function setUp(): void { parent::setUp(); $this->createAndAuthenticateUser(); }

    public function test_can_list_generated_content(): void
    {
        $response = $this->getJson('/api/v1/content');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'title', 'type', 'status']
                ]
            ]);
    }

    public function test_can_generate_content(): void
    {
        $data = [
            'type' => 'article',
            'topic' => 'Test Topic',
            'length' => 'short',
            'tenant_id' => '00000000-0000-0000-0000-000000000000',
        ];

        $response = $this->postJson('/api/v1/content/generate', $data);

        // May return 201 or 202 (accepted) depending on implementation
        $this->assertContains($response->status(), [201, 202, 200]);
    }

    public function test_can_generate_content_from_campaign(): void
    {
        $data = [
            'campaign_id' => 'test-campaign-id',
            'content_type' => 'post',
            'tenant_id' => '00000000-0000-0000-0000-000000000000',
        ];

        $response = $this->postJson('/api/v1/content/generate-from-campaign', $data);

        $this->assertContains($response->status(), [201, 202, 200]);
    }

    public function test_can_list_content_templates(): void
    {
        $response = $this->getJson('/api/v1/content/templates');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'name', 'type']
                ]
            ]);
    }

    public function test_can_create_content_template(): void
    {
        $data = [
            'name' => 'Test Template',
            'type' => 'article',
            'template' => 'Test template content',
            'tenant_id' => '00000000-0000-0000-0000-000000000000',
        ];

        $response = $this->postJson('/api/v1/content/templates', $data);

        $response->assertStatus(201)
            ->assertJsonStructure(['data' => ['id', 'name']]);
    }

    public function test_can_show_generated_content(): void
    {
        $contentId = 'test-content-id';

        $response = $this->getJson("/api/v1/content/{$contentId}");

        $response->assertStatus(200)
            ->assertJsonStructure(['data']);
    }

    public function test_can_update_content_status(): void
    {
        $contentId = 'test-content-id';

        $data = [
            'status' => 'published',
        ];

        $response = $this->postJson("/api/v1/content/{$contentId}/status", $data);

        $response->assertStatus(200)
            ->assertJsonStructure(['data', 'message']);
    }
}
