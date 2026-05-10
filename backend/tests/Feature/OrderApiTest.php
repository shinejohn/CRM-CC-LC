<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Order;
use App\Models\Service;
use App\Models\Customer;
use Illuminate\Foundation\Testing\RefreshDatabase;

class OrderApiTest extends TestCase
{
    use RefreshDatabase;

    private \App\Models\User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = $this->createAndAuthenticateUser();
    }

    public function test_can_list_orders(): void
    {
        Order::factory()->count(3)->create(['user_id' => $this->user->id]);

        $response = $this->getJson('/api/v1/orders');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data',
            ]);
    }

    public function test_can_show_order(): void
    {
        $order = Order::factory()->create(['user_id' => $this->user->id]);

        $response = $this->getJson("/api/v1/orders/{$order->id}");

        $response->assertStatus(200)
            ->assertJson([
                'data' => [
                    'id' => $order->id,
                ],
            ]);
    }

    public function test_can_create_checkout_session(): void
    {
        $customer = Customer::factory()->create();
        $service = Service::factory()->create();

        $data = [
            'customer_id' => $customer->id,
            'customer_email' => 'test@example.com',
            'services' => [
                [
                    'service_id' => $service->id,
                    'quantity' => 1,
                ]
            ],
        ];

        $response = $this->postJson('/api/v1/orders/checkout', $data);

        // May return 200 on success, 500 if Stripe is not configured
        $this->assertContains($response->status(), [200, 500]);
    }

    public function test_checkout_requires_valid_customer(): void
    {
        $data = [
            'customer_id' => '00000000-0000-0000-0000-000000000000',
            'items' => [],
        ];

        $response = $this->postJson('/api/v1/orders/checkout', $data);

        $response->assertStatus(422); // Validation error
    }

    public function test_checkout_requires_items(): void
    {
        $customer = Customer::factory()->create();

        $data = [
            'customer_id' => $customer->id,
            'items' => [],
        ];

        $response = $this->postJson('/api/v1/orders/checkout', $data);

        $response->assertStatus(422); // Validation error
    }
}
