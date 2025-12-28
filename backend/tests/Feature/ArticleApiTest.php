<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Article;
use Illuminate\Foundation\Testing\RefreshDatabase;

class ArticleApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_list_articles(): void
    {
        Article::factory()->count(3)->create();

        $response = $this->getJson('/api/v1/articles');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'title', 'slug', 'excerpt', 'content', 'created_at']
                ]
            ]);
    }

    public function test_can_create_article(): void
    {
        $data = [
            'title' => 'Test Article',
            'slug' => 'test-article',
            'excerpt' => 'Test excerpt',
            'content' => 'Test content',
            'category' => 'general',
            'status' => 'draft',
            'tenant_id' => '00000000-0000-0000-0000-000000000000',
        ];

        $response = $this->postJson('/api/v1/articles', $data);

        $response->assertStatus(201)
            ->assertJsonStructure(['data' => ['id', 'title', 'slug']]);

        $this->assertDatabaseHas('articles', [
            'title' => 'Test Article',
            'slug' => 'test-article',
        ]);
    }

    public function test_can_show_article(): void
    {
        $article = Article::factory()->create();

        $response = $this->getJson("/api/v1/articles/{$article->id}");

        $response->assertStatus(200)
            ->assertJson([
                'data' => [
                    'id' => $article->id,
                    'title' => $article->title,
                ]
            ]);
    }

    public function test_can_update_article(): void
    {
        $article = Article::factory()->create();

        $data = [
            'title' => 'Updated Article',
            'content' => 'Updated content',
        ];

        $response = $this->putJson("/api/v1/articles/{$article->id}", $data);

        $response->assertStatus(200)
            ->assertJson([
                'data' => [
                    'title' => 'Updated Article',
                ]
            ]);

        $this->assertDatabaseHas('articles', [
            'id' => $article->id,
            'title' => 'Updated Article',
        ]);
    }

    public function test_can_delete_article(): void
    {
        $article = Article::factory()->create();

        $response = $this->deleteJson("/api/v1/articles/{$article->id}");

        $response->assertStatus(204);

        $this->assertDatabaseMissing('articles', [
            'id' => $article->id,
        ]);
    }

    public function test_can_update_article_status_to_published(): void
    {
        $article = Article::factory()->create(['status' => 'draft']);

        $data = [
            'status' => 'published',
            'published_at' => now()->toDateTimeString(),
        ];

        $response = $this->putJson("/api/v1/articles/{$article->id}", $data);

        $response->assertStatus(200);

        $this->assertDatabaseHas('articles', [
            'id' => $article->id,
            'status' => 'published',
        ]);
    }
}
