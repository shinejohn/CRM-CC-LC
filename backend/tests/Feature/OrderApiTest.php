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

    public function test_can_list_orders(): void
    {
        Order::factory()->count(3)->create();

        $response = $this->getJson('/api/v1/orders');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'customer_id', 'total_amount', 'status', 'created_at']
                ]
            ]);
    }

    public function test_can_show_order(): void
    {
        $order = Order::factory()->create();

        $response = $this->getJson("/api/v1/orders/{$order->id}");

        $response->assertStatus(200)
            ->assertJson([
                'data' => [
                    'id' => $order->id,
                    'customer_id' => $order->customer_id,
                ]
            ]);
    }

    public function test_can_create_checkout_session(): void
    {
        $customer = Customer::factory()->create();
        $service = Service::factory()->create();

        $data = [
            'customer_id' => $customer->id,
            'items' => [
                [
                    'service_id' => $service->id,
                    'quantity' => 1,
                ]
            ],
        ];

        $response = $this->postJson('/api/v1/orders/checkout', $data);

        // Adjust status code based on your implementation
        // If checkout creates a Stripe session, it might return 200 or 201
        $response->assertStatus(200)
            ->assertJsonStructure(['data']);

        // Verify order was created
        $this->assertDatabaseHas('orders', [
            'customer_id' => $customer->id,
        ]);
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
