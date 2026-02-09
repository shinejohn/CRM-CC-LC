<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

class TTSApiTest extends TestCase
{
    use RefreshDatabase; protected function setUp(): void { parent::setUp(); $this->createAndAuthenticateUser(); }

    public function test_can_generate_audio_from_text(): void
    {
        $data = [
            'text' => 'Hello, this is a test message.',
            'voice_id' => 'default',
            'model' => 'eleven_multilingual_v2',
        ];

        $response = $this->postJson('/api/v1/tts/generate', $data);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => ['audio_url', 'duration', 'text_length']
            ]);
    }

    public function test_can_get_generation_status(): void
    {
        $jobId = 'test-job-id';

        $response = $this->getJson("/api/v1/tts/status/{$jobId}");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => ['status', 'progress', 'audio_url']
            ]);
    }

    public function test_requires_text_for_generation(): void
    {
        $response = $this->postJson('/api/v1/tts/generate', [
            'voice_id' => 'default',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['text']);
    }

    public function test_can_list_available_voices(): void
    {
        $response = $this->getJson('/api/v1/tts/voices');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'name', 'language', 'gender']
                ]
            ]);
    }
}
