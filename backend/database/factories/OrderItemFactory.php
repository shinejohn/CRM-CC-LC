<?php

namespace Database\Factories;

use App\Models\OrderItem;
use App\Models\Order;
use App\Models\Service;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\OrderItem>
 */
class OrderItemFactory extends Factory
{
    protected $model = OrderItem::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $price = fake()->randomFloat(2, 10, 500);
        $quantity = fake()->numberBetween(1, 5);
        $total = $price * $quantity;

        return [
            'order_id' => Order::factory(),
            'service_id' => Service::factory(),
            'service_name' => fake()->words(3, true),
            'service_description' => fake()->optional()->sentence(),
            'quantity' => $quantity,
            'price' => $price,
            'total' => $total,
            'metadata' => null,
        ];
    }
}
