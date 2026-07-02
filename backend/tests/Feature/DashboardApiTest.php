<?php

namespace Tests\Feature;

use App\Models\DashboardWidget;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->createAndAuthenticateUser();
    }

    public function test_widgets_seeds_and_returns_default_set(): void
    {
        $response = $this->getJson('/api/v1/dashboard/widgets');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [['id', 'type', 'title', 'defaultColor', 'position', 'size', 'is_visible']],
            ]);

        // The default layout has 6 widgets, persisted on first load.
        $this->assertCount(6, $response->json('data'));
        $this->assertSame(6, DashboardWidget::query()->count());
    }

    public function test_save_widgets_upserts_layout(): void
    {
        $response = $this->putJson('/api/v1/dashboard/widgets', [
            'widgets' => [
                ['type' => 'tasks', 'title' => 'My Tasks', 'is_visible' => true],
                ['type' => 'email', 'title' => 'Inbox', 'is_visible' => false],
            ],
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure(['data' => [['id', 'type', 'title', 'is_visible']]]);

        $this->assertSame(2, DashboardWidget::query()->count());
        $this->assertDatabaseHas('dashboard_widgets', ['widget_key' => 'tasks', 'title' => 'My Tasks']);
    }

    public function test_recent_activity_returns_feed(): void
    {
        $this->getJson('/api/v1/dashboard/recent-activity')
            ->assertStatus(200)
            ->assertJsonStructure(['data']);
    }
}
