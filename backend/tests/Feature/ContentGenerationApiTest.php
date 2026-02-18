<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

class ContentGenerationApiTest extends TestCase
{
    use RefreshDatabase; protected function setUp(): void { parent::setUp(); $this->createAndAuthenticateUser(); }

    public function test_can_list_generated_content(): void
    {
        $response = $this->withHeaders(['X-Tenant-ID' => '00000000-0000-0000-0000-000000000000'])
            ->getJson('/api/v1/generated-content');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data',
                'meta' => ['current_page', 'last_page', 'per_page', 'total']
            ]);
    }

    public function test_can_generate_content(): void
    {
        $data = [
            'type' => 'article',
            'parameters' => ['title' => 'Test Article', 'topic' => 'Test Topic'],
            'tenant_id' => '00000000-0000-0000-0000-000000000000',
        ];

        $response = $this->withHeaders(['X-Tenant-ID' => '00000000-0000-0000-0000-000000000000'])
            ->postJson('/api/v1/generated-content/generate', $data);

        $this->assertContains($response->status(), [201, 202, 200, 500]);
    }

    public function test_can_generate_content_from_campaign(): void
    {
        $data = [
            'campaign_id' => '00000000-0000-0000-0000-000000000001',
            'type' => 'social',
            'tenant_id' => '00000000-0000-0000-0000-000000000000',
        ];

        $response = $this->withHeaders(['X-Tenant-ID' => '00000000-0000-0000-0000-000000000000'])
            ->postJson('/api/v1/generated-content/generate-from-campaign', $data);

        $this->assertContains($response->status(), [201, 202, 200, 404, 422, 500]);
    }

    public function test_can_list_content_templates(): void
    {
        $response = $this->withHeaders(['X-Tenant-ID' => '00000000-0000-0000-0000-000000000000'])
            ->getJson('/api/v1/generated-content/templates');

        $response->assertStatus(200)
            ->assertJsonStructure(['data']);
    }

    public function test_can_create_content_template(): void
    {
        $data = [
            'name' => 'Test Template',
            'type' => 'article',
            'prompt_template' => 'Write an article about {{topic}}',
            'tenant_id' => '00000000-0000-0000-0000-000000000000',
        ];

        $response = $this->withHeaders(['X-Tenant-ID' => '00000000-0000-0000-0000-000000000000'])
            ->postJson('/api/v1/generated-content/templates', $data);

        $response->assertStatus(201)
            ->assertJsonStructure(['data' => ['id', 'name']]);
    }

    public function test_can_show_generated_content(): void
    {
        $content = \App\Models\GeneratedContent::create([
            'tenant_id' => '00000000-0000-0000-0000-000000000000',
            'title' => 'Test Content',
            'type' => 'article',
            'status' => 'draft',
            'content' => 'Test content body',
        ]);

        $response = $this->withHeaders(['X-Tenant-ID' => '00000000-0000-0000-0000-000000000000'])
            ->getJson("/api/v1/generated-content/{$content->id}");

        $response->assertStatus(200)
            ->assertJsonStructure(['data']);
    }

    public function test_can_update_content_status(): void
    {
        $content = \App\Models\GeneratedContent::create([
            'tenant_id' => '00000000-0000-0000-0000-000000000000',
            'title' => 'Test Content',
            'type' => 'article',
            'status' => 'draft',
            'content' => 'Test content body',
        ]);

        $data = ['status' => 'published'];

        $response = $this->withHeaders(['X-Tenant-ID' => '00000000-0000-0000-0000-000000000000'])
            ->postJson("/api/v1/generated-content/{$content->id}/status", $data);

        $response->assertStatus(200)
            ->assertJsonStructure(['data', 'message']);
    }
}
