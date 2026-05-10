<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Knowledge;
use App\Models\FaqCategory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;

class KnowledgeApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->createAndAuthenticateUser();
        Queue::fake();
    }

    public function test_can_list_knowledge_items(): void
    {
        Knowledge::factory()->count(3)->create();

        $response = $this->getJson('/api/v1/knowledge');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'title', 'content', 'category', 'created_at']
                ]
            ]);
    }

    public function test_can_create_knowledge_item(): void
    {
        $data = [
            'title' => 'Test Knowledge',
            'content' => 'Test content',
            'category' => 'general',
            'tenant_id' => '00000000-0000-0000-0000-000000000000',
        ];

        $response = $this->postJson('/api/v1/knowledge', $data);

        $response->assertStatus(201)
            ->assertJsonStructure(['data' => ['id', 'title', 'content']]);

        $this->assertDatabaseHas('knowledge_base', [
            'title' => 'Test Knowledge',
            'content' => 'Test content',
        ]);
    }

    public function test_can_show_knowledge_item(): void
    {
        $knowledge = Knowledge::factory()->create();

        $response = $this->getJson("/api/v1/knowledge/{$knowledge->id}");

        $response->assertStatus(200)
            ->assertJson([
                'data' => [
                    'id' => $knowledge->id,
                    'title' => $knowledge->title,
                ]
            ]);
    }

    public function test_can_update_knowledge_item(): void
    {
        $knowledge = Knowledge::factory()->create();

        $data = [
            'title' => 'Updated Title',
            'content' => 'Updated content',
        ];

        $response = $this->putJson("/api/v1/knowledge/{$knowledge->id}", $data);

        $response->assertStatus(200)
            ->assertJson([
                'data' => [
                    'title' => 'Updated Title',
                    'content' => 'Updated content',
                ]
            ]);

        $this->assertDatabaseHas('knowledge_base', [
            'id' => $knowledge->id,
            'title' => 'Updated Title',
        ]);
    }

    public function test_can_delete_knowledge_item(): void
    {
        $knowledge = Knowledge::factory()->create();

        $response = $this->deleteJson("/api/v1/knowledge/{$knowledge->id}");

        $response->assertStatus(204);

        $this->assertDatabaseMissing('knowledge_base', [
            'id' => $knowledge->id,
        ]);
    }

    public function test_can_vote_on_knowledge_item(): void
    {
        $knowledge = Knowledge::factory()->create();

        $response = $this->postJson("/api/v1/knowledge/{$knowledge->id}/vote", [
            'vote' => 'helpful',
        ]);

        $response->assertStatus(200);
    }

    public function test_can_list_faq_categories(): void
    {
        FaqCategory::factory()->count(3)->create();

        $response = $this->getJson('/api/v1/faq-categories');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'name', 'description', 'parent_id']
                ]
            ]);
    }

    public function test_can_create_faq_category(): void
    {
        $data = [
            'name' => 'Test Category',
            'slug' => 'test-category',
            'description' => 'Test description',
            'tenant_id' => '00000000-0000-0000-0000-000000000000',
        ];

        $response = $this->postJson('/api/v1/faq-categories', $data);

        $response->assertStatus(201)
            ->assertJsonStructure(['data' => ['id', 'name', 'description']]);

        $this->assertDatabaseHas('faq_categories', [
            'name' => 'Test Category',
        ]);
    }
}
