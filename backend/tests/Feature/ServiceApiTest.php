<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Service;
use App\Models\ServiceCategory;
use Illuminate\Foundation\Testing\RefreshDatabase;

class ServiceApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_list_services(): void
    {
        Service::factory()->count(5)->create();

        $response = $this->getJson('/api/v1/services');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'name', 'slug', 'price', 'billing_period']
                ]
            ]);
    }

    public function test_can_show_service(): void
    {
        $service = Service::factory()->create();

        $response = $this->getJson("/api/v1/services/{$service->id}");

        $response->assertStatus(200)
            ->assertJson([
                'data' => [
                    'id' => $service->id,
                    'name' => $service->name,
                ]
            ]);
    }

    public function test_can_filter_services_by_category(): void
    {
        $category = ServiceCategory::factory()->create();
        Service::factory()->count(3)->create(['service_category_id' => $category->id]);
        Service::factory()->count(2)->create();

        $response = $this->getJson("/api/v1/services?category_id={$category->id}");

        $response->assertStatus(200);
        $data = $response->json('data');
        $this->assertCount(3, $data);
    }

    public function test_can_filter_services_by_type(): void
    {
        Service::factory()->count(3)->create(['service_type' => 'fibonacco']);
        Service::factory()->count(2)->create(['service_type' => 'day.news']);

        $response = $this->getJson('/api/v1/services?service_type=fibonacco');

        $response->assertStatus(200);
        $data = $response->json('data');
        foreach ($data as $service) {
            $this->assertEquals('fibonacco', $service['service_type']);
        }
    }

    public function test_can_filter_active_services(): void
    {
        Service::factory()->count(3)->create(['is_active' => true]);
        Service::factory()->count(2)->create(['is_active' => false]);

        $response = $this->getJson('/api/v1/services?is_active=true');

        $response->assertStatus(200);
        $data = $response->json('data');
        foreach ($data as $service) {
            $this->assertTrue($service['is_active']);
        }
    }
}
