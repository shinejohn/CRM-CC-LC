<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Knowledge;
use Illuminate\Foundation\Testing\RefreshDatabase;

class TrainingApiTest extends TestCase
{
    use RefreshDatabase; protected function setUp(): void { parent::setUp(); $this->createAndAuthenticateUser(); }

    public function test_can_list_training_courses(): void
    {
        // Create training content in knowledge_base
        Knowledge::factory()->create([
            'category' => 'training',
            'is_public' => true,
        ]);

        $response = $this->getJson('/api/v1/training?tenant_id=00000000-0000-0000-0000-000000000000');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'title', 'content']
                ]
            ]);
    }

    public function test_can_show_training_course(): void
    {
        $content = Knowledge::factory()->create([
            'category' => 'training',
            'is_public' => true,
        ]);

        $response = $this->getJson("/api/v1/training/{$content->id}");

        $response->assertStatus(200)
            ->assertJsonStructure(['data' => ['id', 'title', 'content']]);
    }

    public function test_can_mark_training_helpful(): void
    {
        $content = Knowledge::factory()->create([
            'category' => 'training',
            'is_public' => true,
        ]);

        $response = $this->postJson("/api/v1/training/{$content->id}/helpful");

        $response->assertStatus(200)
            ->assertJsonStructure(['data', 'message']);
    }

    public function test_can_mark_training_not_helpful(): void
    {
        $content = Knowledge::factory()->create([
            'category' => 'training',
            'is_public' => true,
        ]);

        $response = $this->postJson("/api/v1/training/{$content->id}/not-helpful");

        $response->assertStatus(200)
            ->assertJsonStructure(['data', 'message']);
    }
}
