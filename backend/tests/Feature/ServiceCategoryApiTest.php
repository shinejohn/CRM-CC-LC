<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\ServiceCategory;
use App\Models\Service;
use Illuminate\Foundation\Testing\RefreshDatabase;

class ServiceCategoryApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_list_service_categories(): void
    {
        ServiceCategory::factory()->count(5)->create();

        $response = $this->getJson('/api/v1/services/categories');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'name', 'slug', 'description']
                ]
            ]);
    }

    public function test_can_show_service_category(): void
    {
        $category = ServiceCategory::factory()->create();

        $response = $this->getJson("/api/v1/services/categories/{$category->id}");

        $response->assertStatus(200)
            ->assertJson([
                'data' => [
                    'id' => $category->id,
                    'name' => $category->name,
                ]
            ]);
    }

    public function test_can_list_services_in_category(): void
    {
        $category = ServiceCategory::factory()->create();
        Service::factory()->count(3)->create(['service_category_id' => $category->id]);
        Service::factory()->count(2)->create(); // Other category

        $response = $this->getJson("/api/v1/services/categories/{$category->id}/services");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'name', 'price']
                ]
            ]);
        
        $data = $response->json('data');
        $this->assertCount(3, $data);
    }

    public function test_can_create_service_category(): void
    {
        $data = [
            'name' => 'Test Category',
            'slug' => 'test-category',
            'description' => 'Test description',
            'tenant_id' => '00000000-0000-0000-0000-000000000000',
        ];

        $response = $this->postJson('/api/v1/services/categories', $data);

        $response->assertStatus(201)
            ->assertJsonStructure(['data' => ['id', 'name', 'slug']]);

        $this->assertDatabaseHas('service_categories', [
            'name' => 'Test Category',
            'slug' => 'test-category',
        ]);
    }

    public function test_can_update_service_category(): void
    {
        $category = ServiceCategory::factory()->create();

        $data = [
            'name' => 'Updated Category',
            'description' => 'Updated description',
        ];

        $response = $this->putJson("/api/v1/services/categories/{$category->id}", $data);

        $response->assertStatus(200)
            ->assertJson([
                'data' => [
                    'name' => 'Updated Category',
                ]
            ]);

        $this->assertDatabaseHas('service_categories', [
            'id' => $category->id,
            'name' => 'Updated Category',
        ]);
    }

    public function test_can_delete_service_category(): void
    {
        $category = ServiceCategory::factory()->create();

        $response = $this->deleteJson("/api/v1/services/categories/{$category->id}");

        $response->assertStatus(204);

        $this->assertDatabaseMissing('service_categories', [
            'id' => $category->id,
        ]);
    }
}
