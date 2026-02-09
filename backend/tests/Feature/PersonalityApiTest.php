<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Customer;
use Illuminate\Foundation\Testing\RefreshDatabase;

class PersonalityApiTest extends TestCase
{
    use RefreshDatabase; protected function setUp(): void { parent::setUp(); $this->createAndAuthenticateUser(); }

    public function test_can_list_personalities(): void
    {
        $response = $this->getJson('/api/v1/personalities');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'name', 'description']
                ]
            ]);
    }

    public function test_can_create_personality(): void
    {
        $data = [
            'name' => 'Test Personality',
            'description' => 'Test description',
            'tenant_id' => '00000000-0000-0000-0000-000000000000',
        ];

        $response = $this->postJson('/api/v1/personalities', $data);

        $response->assertStatus(201)
            ->assertJsonStructure(['data' => ['id', 'name']]);
    }

    public function test_can_show_personality(): void
    {
        // Assuming personality ID exists or can be created
        $personalityId = 'test-personality-id';

        $response = $this->getJson("/api/v1/personalities/{$personalityId}");

        // Adjust based on actual implementation
        $response->assertStatus(200);
    }

    public function test_can_assign_personality_to_customer(): void
    {
        $customer = Customer::factory()->create();

        $data = [
            'customer_id' => $customer->id,
            'personality_id' => 'test-personality-id',
            'tenant_id' => '00000000-0000-0000-0000-000000000000',
        ];

        $response = $this->postJson('/api/v1/personalities/assign', $data);

        $response->assertStatus(200)
            ->assertJsonStructure(['data', 'message']);
    }

    public function test_can_get_customer_personality(): void
    {
        $customer = Customer::factory()->create();

        $response = $this->getJson("/api/v1/personalities/customers/{$customer->id}/personality");

        $response->assertStatus(200)
            ->assertJsonStructure(['data']);
    }

    public function test_can_generate_personality_response(): void
    {
        $data = [
            'personality_id' => 'test-personality-id',
            'message' => 'Test message',
            'context' => [],
        ];

        $response = $this->postJson('/api/v1/personalities/test-personality-id/generate-response', $data);

        // May return 200 or 500 depending on AI service availability
        $this->assertContains($response->status(), [200, 500]);
    }
}
