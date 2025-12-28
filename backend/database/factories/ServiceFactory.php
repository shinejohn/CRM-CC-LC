<?php

namespace Database\Factories;

use App\Models\Service;
use App\Models\ServiceCategory;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Service>
 */
class ServiceFactory extends Factory
{
    protected $model = Service::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = fake()->words(3, true);
        $isSubscription = fake()->boolean(50);
        
        return [
            'tenant_id' => '00000000-0000-0000-0000-000000000000',
            'service_category_id' => ServiceCategory::factory(),
            'name' => $name,
            'slug' => \Illuminate\Support\Str::slug($name) . '-' . fake()->unique()->randomNumber(4),
            'description' => fake()->paragraph(),
            'long_description' => fake()->optional()->paragraphs(2, true),
            'images' => null,
            'price' => fake()->randomFloat(2, 10, 1000),
            'compare_at_price' => fake()->optional()->randomFloat(2, 1000, 2000),
            'service_type' => fake()->randomElement(['day.news', 'goeventcity', 'downtownsguide', 'golocalvoices', 'alphasite', 'fibonacco']),
            'service_tier' => fake()->randomElement(['basic', 'standard', 'premium', 'enterprise']),
            'is_subscription' => $isSubscription,
            'billing_period' => $isSubscription ? fake()->randomElement(['monthly', 'annual']) : 'one-time',
            'features' => null,
            'capabilities' => null,
            'integrations' => null,
            'quantity' => 0,
            'track_inventory' => false,
            'sku' => fake()->optional()->bothify('SKU-####'),
            'is_active' => true,
            'is_featured' => false,
            'stripe_price_id' => fake()->optional()->string(),
            'stripe_product_id' => fake()->optional()->string(),
            'metadata' => null,
        ];
    }

    /**
     * Indicate that the service is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }

    /**
     * Create a monthly subscription service.
     */
    public function monthly(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_subscription' => true,
            'billing_period' => 'monthly',
        ]);
    }

    /**
     * Create a one-time service.
     */
    public function oneTime(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_subscription' => false,
            'billing_period' => 'one-time',
        ]);
    }
}
