<?php

namespace Database\Factories;

use App\Models\Customer;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Customer>
 */
class CustomerFactory extends Factory
{
    protected $model = Customer::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $businessName = $this->faker->company();
        
        return [
            'id' => (string) Str::uuid(),
            'tenant_id' => (string) Str::uuid(),
            'slug' => Str::slug($businessName) . '-' . Str::random(6),
            'business_name' => $businessName,
            'owner_name' => $this->faker->name(),
            'email' => $this->faker->unique()->safeEmail(),
            'phone' => $this->faker->phoneNumber(),
            'website' => $this->faker->url(),
            'industry_category' => $this->faker->randomElement(['restaurant', 'retail', 'services', 'manufacturing']),
            'industry_subcategory' => $this->faker->word(),
            'city' => $this->faker->city(),
            'state' => $this->faker->stateAbbr(),
            'zip' => $this->faker->postcode(),
            'country' => 'US',
            'lead_score' => $this->faker->numberBetween(0, 100),
            'lead_source' => $this->faker->randomElement(['website', 'referral', 'cold_call', 'social']),
        ];
    }
}
