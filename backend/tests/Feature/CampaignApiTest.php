<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;

class CampaignApiTest extends TestCase
{
    use RefreshDatabase; protected function setUp(): void { parent::setUp(); $this->createAndAuthenticateUser(); }

    public function test_can_list_campaigns(): void
    {
        // Assuming campaigns are stored in a campaigns table
        // Adjust based on your actual schema
        DB::table('campaigns')->insert([
            'id' => 'TEST-001',
            'type' => 'email',
            'week' => 1,
            'day' => 1,
            'title' => 'Test Campaign',
            'subject' => 'Test Subject',
            'slug' => 'test-campaign',
            'landing_page_slug' => 'test-campaign',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $response = $this->getJson('/api/v1/campaigns');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'title', 'landing_page_slug']
                ]
            ]);
    }

    public function test_can_show_campaign_by_slug(): void
    {
        DB::table('campaigns')->insert([
            'id' => 'TEST-002',
            'type' => 'email',
            'week' => 1,
            'day' => 2,
            'title' => 'Test Campaign 2',
            'subject' => 'Test Subject 2',
            'slug' => 'test-campaign-2',
            'landing_page_slug' => 'test-campaign-2',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $response = $this->getJson('/api/v1/campaigns/test-campaign-2');

        $response->assertStatus(200)
            ->assertJson([
                'data' => [
                    'landing_page_slug' => 'test-campaign-2',
                ]
            ]);
    }

    public function test_returns_404_for_nonexistent_campaign(): void
    {
        $response = $this->getJson('/api/v1/campaigns/nonexistent');

        $response->assertStatus(404);
    }
}
