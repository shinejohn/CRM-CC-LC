<?php

namespace Database\Factories;

use App\Models\Order;
use App\Models\Customer;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Order>
 */
class OrderFactory extends Factory
{
    protected $model = Order::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $subtotal = fake()->randomFloat(2, 10, 1000);
        $tax = fake()->randomFloat(2, 1, 100);
        $shipping = fake()->randomFloat(2, 0, 50);
        $total = $subtotal + $tax + $shipping;

        return [
            'tenant_id' => '00000000-0000-0000-0000-000000000000',
            'customer_id' => Customer::factory(),
            'customer_email' => fake()->safeEmail(),
            'customer_name' => fake()->name(),
            'order_number' => 'ORD-' . strtoupper(fake()->unique()->bothify('####-####')),
            'status' => fake()->randomElement(['pending', 'processing', 'completed', 'cancelled', 'refunded']),
            'subtotal' => $subtotal,
            'tax' => $tax,
            'shipping' => $shipping,
            'total' => $total,
            'payment_status' => fake()->randomElement(['pending', 'paid', 'failed', 'refunded']),
            'stripe_payment_intent_id' => fake()->optional()->uuid(),
            'stripe_charge_id' => fake()->optional()->uuid(),
            'stripe_session_id' => fake()->optional()->uuid(),
            'billing_address' => [
                'street' => fake()->streetAddress(),
                'city' => fake()->city(),
                'state' => fake()->stateAbbr(),
                'zip' => fake()->postcode(),
                'country' => 'US',
            ],
            'shipping_address' => null,
            'notes' => fake()->optional()->sentence(),
            'paid_at' => null,
        ];
    }

    /**
     * Indicate that the order is paid.
     */
    public function paid(): static
    {
        return $this->state(fn (array $attributes) => [
            'payment_status' => 'paid',
            'status' => 'processing',
        ]);
    }

    /**
     * Indicate that the order is completed.
     */
    public function completed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'completed',
            'payment_status' => 'paid',
        ]);
    }

    /**
     * Indicate that the order is cancelled.
     */
    public function cancelled(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'cancelled',
        ]);
    }
}
