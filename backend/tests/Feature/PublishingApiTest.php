<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

class PublishingApiTest extends TestCase
{
    use RefreshDatabase; protected function setUp(): void { parent::setUp(); $this->createAndAuthenticateUser(); }

    public function test_can_get_publishing_dashboard(): void
    {
        $response = $this->getJson('/api/v1/publishing/dashboard');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'content_stats',
                    'recent_content',
                ]
            ]);
    }

    public function test_can_get_publishing_calendar(): void
    {
        $response = $this->getJson('/api/v1/publishing/calendar?month=2024-12');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'content',
                    'ads',
                ]
            ]);
    }

    public function test_can_get_publishing_analytics(): void
    {
        $response = $this->getJson('/api/v1/publishing/analytics?start_date=2024-01-01&end_date=2024-12-31');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'content_over_time',
                    'ad_performance',
                ]
            ]);
    }

    public function test_can_publish_content(): void
    {
        $content = \App\Models\GeneratedContent::factory()->create();

        $data = [
            'channels' => ['facebook', 'twitter'],
        ];

        $response = $this->postJson("/api/v1/publishing/content/{$content->id}/publish", $data);

        $response->assertStatus(200)
            ->assertJsonStructure(['data', 'message']);
    }
}
