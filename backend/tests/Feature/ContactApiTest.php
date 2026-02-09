<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Customer;
use Illuminate\Foundation\Testing\RefreshDatabase;

class ContactApiTest extends TestCase
{
    use RefreshDatabase; protected function setUp(): void { parent::setUp(); $this->createAndAuthenticateUser(); }

    public function test_can_contact_customer(): void
    {
        $customer = Customer::factory()->create();

        $data = [
            'customer_id' => $customer->id,
            'contact_method' => 'email',
            'subject' => 'Test Subject',
            'message' => 'Test message',
            'tenant_id' => '00000000-0000-0000-0000-000000000000',
        ];

        $response = $this->postJson('/api/v1/personality-contacts/contact', $data);

        $response->assertStatus(200)
            ->assertJsonStructure(['data', 'message']);
    }

    public function test_can_schedule_contact(): void
    {
        $customer = Customer::factory()->create();

        $data = [
            'customer_id' => $customer->id,
            'contact_method' => 'phone',
            'scheduled_at' => now()->addDays(1)->toDateTimeString(),
            'message' => 'Scheduled call',
            'tenant_id' => '00000000-0000-0000-0000-000000000000',
        ];

        $response = $this->postJson('/api/v1/personality-contacts/schedule', $data);

        $response->assertStatus(201)
            ->assertJsonStructure(['data', 'message']);
    }

    public function test_can_get_customer_contact_preferences(): void
    {
        $customer = Customer::factory()->create();

        $response = $this->getJson("/api/v1/personality-contacts/customers/{$customer->id}/preferences");

        $response->assertStatus(200)
            ->assertJsonStructure(['data']);
    }

    public function test_can_update_customer_contact_preferences(): void
    {
        $customer = Customer::factory()->create();

        $data = [
            'preferred_method' => 'email',
            'preferred_time' => 'morning',
            'do_not_contact' => false,
        ];

        $response = $this->putJson("/api/v1/personality-contacts/customers/{$customer->id}/preferences", $data);

        $response->assertStatus(200)
            ->assertJsonStructure(['data', 'message']);
    }
}
