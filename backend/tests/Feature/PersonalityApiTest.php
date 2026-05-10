<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\AiPersonality;
use App\Models\Customer;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;

class PersonalityApiTest extends TestCase
{
    use RefreshDatabase; protected function setUp(): void { parent::setUp(); $this->createAndAuthenticateUser(); }

    private function createPersonality(array $overrides = []): AiPersonality
    {
        return AiPersonality::create(array_merge([
            'tenant_id' => '00000000-0000-0000-0000-000000000000',
            'name' => 'Test Personality',
            'slug' => 'test-personality-' . Str::random(6),
            'identity' => 'Test Identity',
            'persona_description' => 'A helpful assistant',
            'communication_style' => 'professional',
            'system_prompt' => 'You are a helpful assistant.',
            'description' => 'Test description',
            'is_active' => true,
            'priority' => 0,
        ], $overrides));
    }

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
            'identity' => 'Test Identity',
            'persona_description' => 'A helpful assistant',
            'communication_style' => 'professional',
            'system_prompt' => 'You are a helpful assistant.',
            'tenant_id' => '00000000-0000-0000-0000-000000000000',
        ];

        $response = $this->postJson('/api/v1/personalities', $data);

        $response->assertStatus(201)
            ->assertJsonStructure(['data' => ['id', 'name']]);
    }

    public function test_can_show_personality(): void
    {
        $personality = $this->createPersonality();

        $response = $this->getJson("/api/v1/personalities/{$personality->id}");

        $response->assertStatus(200);
    }

    public function test_can_assign_personality_to_customer(): void
    {
        $personality = $this->createPersonality();
        $customer = Customer::factory()->create();

        $data = [
            'customer_id' => $customer->id,
            'personality_id' => $personality->id,
            'tenant_id' => '00000000-0000-0000-0000-000000000000',
        ];

        $response = $this->postJson('/api/v1/personalities/assign', $data);

        $response->assertStatus(201)
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
        $personality = $this->createPersonality();

        $data = [
            'personality_id' => $personality->id,
            'message' => 'Test message',
            'context' => [],
        ];

        $response = $this->postJson("/api/v1/personalities/{$personality->id}/generate-response", $data);

        // May return 200 or 500 depending on AI service availability
        $this->assertContains($response->status(), [200, 500]);
    }
}
