<?php

namespace Database\Factories;

use App\Models\SurveySection;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\SurveySection>
 */
class SurveySectionFactory extends Factory
{
    protected $model = SurveySection::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'tenant_id' => '00000000-0000-0000-0000-000000000000',
            'name' => fake()->sentence(3),
            'description' => fake()->optional()->paragraph(),
            'display_order' => fake()->numberBetween(0, 10),
            'is_required' => fake()->boolean(70),
            'is_conditional' => false,
            'condition_config' => null,
        ];
    }

    /**
     * Indicate that the section is required.
     */
    public function required(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_required' => true,
        ]);
    }

    /**
     * Indicate that the section is optional.
     */
    public function optional(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_required' => false,
        ]);
    }
}
