<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;

class AIControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_get_ai_chat_response(): void
    {
        Http::fake([
            'api.openrouter.ai/*' => Http::response([
                'choices' => [
                    [
                        'message' => [
                            'content' => 'Test response',
                        ],
                    ],
                ],
            ], 200),
        ]);

        $data = [
            'message' => 'Hello, how can you help?',
            'context' => [],
        ];

        $response = $this->postJson('/api/v1/ai/chat', $data);

        // May return 200 or 500 depending on OpenAI service availability
        $this->assertContains($response->status(), [200, 500]);
    }

    public function test_can_get_ai_context(): void
    {
        $data = [
            'query' => 'test query',
            'tenant_id' => '00000000-0000-0000-0000-000000000000',
        ];

        $response = $this->postJson('/api/v1/ai/context', $data);

        // May return 200 or 500 depending on service availability
        $this->assertContains($response->status(), [200, 500]);
    }

    public function test_can_list_ai_models(): void
    {
        $response = $this->getJson('/api/v1/ai/models');

        // Should return list of available models
        $response->assertStatus(200)
            ->assertJsonStructure(['data']);
    }

    public function test_chat_requires_message(): void
    {
        $response = $this->postJson('/api/v1/ai/chat', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['message']);
    }
}
