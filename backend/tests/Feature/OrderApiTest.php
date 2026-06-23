<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Service;
use App\Models\Customer;
use App\Services\StripeService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;

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

        $mock = Mockery::mock(StripeService::class);
        $mock->shouldReceive('createCheckoutSession')->once()->andReturn(
            \Stripe\Checkout\Session::constructFrom([
                'id' => 'cs_test_single_123',
                'url' => 'https://checkout.stripe.test/cs_test_single_123',
                'payment_intent' => 'pi_test_single_123',
            ])
        );
        $this->app->instance(StripeService::class, $mock);

        $response = $this->postJson('/api/v1/orders/checkout', $data);

        $response->assertStatus(200)
            ->assertJsonStructure(['session_id', 'url', 'order_id']);
    }

    public function test_multi_item_cart_creates_single_session_with_multiple_line_items(): void
    {
        $tenantId = '00000000-0000-0000-0000-000000000000';
        $customer = Customer::factory()->create();

        // Three distinct services + add-ons in one cart, varied prices/quantities.
        $serviceA = Service::factory()->create([
            'tenant_id' => $tenantId,
            'name' => 'GEC Premium Event',
            'price' => 99.00,
            'track_inventory' => false,
            'is_active' => true,
        ]);
        $serviceB = Service::factory()->create([
            'tenant_id' => $tenantId,
            'name' => 'DN Coupons',
            'price' => 75.00,
            'track_inventory' => false,
            'is_active' => true,
        ]);
        $addOn = Service::factory()->create([
            'tenant_id' => $tenantId,
            'name' => 'SMS Event Reminders',
            'price' => 25.00,
            'track_inventory' => false,
            'is_active' => true,
        ]);

        // 99*1 + 75*2 + 25*1 = 274.00
        $expectedTotal = 274.00;

        // Capture the line_items array the controller passes to Stripe so we
        // can assert one session contains multiple line items. No network.
        $capturedLineItems = null;

        $mock = Mockery::mock(StripeService::class);
        $mock->shouldReceive('createCheckoutSession')
            ->once()
            ->andReturnUsing(function (array $lineItems) use (&$capturedLineItems) {
                $capturedLineItems = $lineItems;

                return \Stripe\Checkout\Session::constructFrom([
                    'id' => 'cs_test_multi_123',
                    'url' => 'https://checkout.stripe.test/cs_test_multi_123',
                    'payment_intent' => 'pi_test_multi_123',
                ]);
            });
        $this->app->instance(StripeService::class, $mock);

        $response = $this->postJson('/api/v1/orders/checkout', [
            'customer_id' => $customer->id,
            'customer_email' => 'multi@example.com',
            'customer_name' => 'Multi Cart',
            'services' => [
                ['service_id' => $serviceA->id, 'quantity' => 1],
                ['service_id' => $serviceB->id, 'quantity' => 2],
                ['service_id' => $addOn->id, 'quantity' => 1],
            ],
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'session_id' => 'cs_test_multi_123',
                'url' => 'https://checkout.stripe.test/cs_test_multi_123',
            ]);

        // One Stripe session received THREE line items.
        $this->assertNotNull($capturedLineItems);
        $this->assertCount(3, $capturedLineItems);

        // Each line item is a price_data entry with the right unit amount + qty.
        $this->assertSame(9900, $capturedLineItems[0]['price_data']['unit_amount']);
        $this->assertSame(1, $capturedLineItems[0]['quantity']);
        $this->assertSame(7500, $capturedLineItems[1]['price_data']['unit_amount']);
        $this->assertSame(2, $capturedLineItems[1]['quantity']);
        $this->assertSame(2500, $capturedLineItems[2]['price_data']['unit_amount']);
        $this->assertSame(1, $capturedLineItems[2]['quantity']);

        // Line-item sum (in cents) equals the persisted order total.
        $lineItemSumCents = array_sum(array_map(
            fn ($li) => $li['price_data']['unit_amount'] * $li['quantity'],
            $capturedLineItems
        ));
        $this->assertSame((int) round($expectedTotal * 100), $lineItemSumCents);

        // Order persisted with the summed total and the session id.
        $orderId = $response->json('order_id');
        $order = Order::findOrFail($orderId);
        $this->assertEquals($expectedTotal, (float) $order->total);
        $this->assertSame('cs_test_multi_123', $order->stripe_session_id);

        // All three purchased items persisted as order items.
        $items = OrderItem::where('order_id', $orderId)->get();
        $this->assertCount(3, $items);
        $this->assertEqualsCanonicalizing(
            [99.00, 150.00, 25.00],
            $items->pluck('total')->map(fn ($t) => (float) $t)->all()
        );
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
