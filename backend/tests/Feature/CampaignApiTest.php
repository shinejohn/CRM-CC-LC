<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;

class CampaignApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_list_campaigns(): void
    {
        // Assuming campaigns are stored in a campaigns table
        // Adjust based on your actual schema
        DB::table('campaigns')->insert([
            'campaign_id' => 'TEST-001',
            'template_name' => 'Test Campaign',
            'landing_page_slug' => 'test-campaign',
            'tenant_id' => '00000000-0000-0000-0000-000000000000',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $response = $this->getJson('/api/v1/campaigns');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => ['campaign_id', 'template_name', 'landing_page_slug']
                ]
            ]);
    }

    public function test_can_show_campaign_by_slug(): void
    {
        DB::table('campaigns')->insert([
            'campaign_id' => 'TEST-002',
            'template_name' => 'Test Campaign 2',
            'landing_page_slug' => 'test-campaign-2',
            'tenant_id' => '00000000-0000-0000-0000-000000000000',
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
