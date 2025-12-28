<?php

namespace Tests\Unit\Services;

use Tests\TestCase;
use App\Services\OpenAIService;
use Mockery;
use Illuminate\Support\Facades\Http;

class OpenAIServiceTest extends TestCase
{
    protected OpenAIService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new OpenAIService();
    }

    public function test_can_generate_embedding(): void
    {
        // Mock HTTP response
        Http::fake([
            'api.openai.com/v1/embeddings' => Http::response([
                'data' => [
                    [
                        'embedding' => array_fill(0, 1536, 0.1),
                        'index' => 0,
                    ]
                ]
            ], 200),
        ]);

        $text = 'Test text for embedding';
        $result = $this->service->generateEmbedding($text);

        $this->assertIsArray($result);
        $this->assertCount(1536, $result);
    }

    public function test_handles_api_error(): void
    {
        Http::fake([
            'api.openai.com/v1/embeddings' => Http::response([], 500),
        ]);

        $this->expectException(\Exception::class);
        $this->service->generateEmbedding('Test text');
    }

    // Add more tests for other OpenAI service methods
}
