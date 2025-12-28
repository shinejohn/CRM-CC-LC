<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

class PublishingApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_get_publishing_dashboard(): void
    {
        $response = $this->getJson('/api/v1/publishing/dashboard');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'stats',
                    'recent_content',
                    'scheduled_content',
                ]
            ]);
    }

    public function test_can_get_publishing_calendar(): void
    {
        $response = $this->getJson('/api/v1/publishing/calendar?month=2024-12');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => ['date', 'content', 'status']
                ]
            ]);
    }

    public function test_can_get_publishing_analytics(): void
    {
        $response = $this->getJson('/api/v1/publishing/analytics?start_date=2024-01-01&end_date=2024-12-31');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'total_published',
                    'engagement_metrics',
                    'platform_breakdown',
                ]
            ]);
    }

    public function test_can_publish_content(): void
    {
        $contentId = 'test-content-id';

        $data = [
            'platforms' => ['facebook', 'twitter'],
            'scheduled_at' => now()->addHour()->toDateTimeString(),
        ];

        $response = $this->postJson("/api/v1/publishing/content/{$contentId}/publish", $data);

        $response->assertStatus(200)
            ->assertJsonStructure(['data', 'message']);
    }
}
