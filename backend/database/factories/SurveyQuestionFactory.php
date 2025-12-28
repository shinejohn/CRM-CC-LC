<?php

namespace Database\Factories;

use App\Models\SurveyQuestion;
use App\Models\SurveySection;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\SurveyQuestion>
 */
class SurveyQuestionFactory extends Factory
{
    protected $model = SurveyQuestion::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'section_id' => SurveySection::factory(),
            'question_text' => fake()->sentence() . '?',
            'help_text' => fake()->optional()->sentence(),
            'question_type' => fake()->randomElement(['text', 'textarea', 'select', 'multiselect', 'radio', 'checkbox', 'rating', 'date']),
            'is_required' => fake()->boolean(70),
            'display_order' => fake()->numberBetween(0, 20),
            'validation_rules' => null,
            'options' => null,
            'scale_config' => null,
            'is_conditional' => false,
            'show_when' => null,
            'auto_populate_source' => null,
            'requires_owner_verification' => false,
            'industry_specific' => false,
            'applies_to_industries' => null,
        ];
    }

    /**
     * Indicate that the question is required.
     */
    public function required(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_required' => true,
        ]);
    }

    /**
     * Indicate that the question is optional.
     */
    public function optional(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_required' => false,
        ]);
    }

    /**
     * Create a select-type question.
     */
    public function select(): static
    {
        return $this->state(fn (array $attributes) => [
            'question_type' => 'select',
            'options' => json_encode([
                fake()->word(),
                fake()->word(),
                fake()->word(),
            ]),
        ]);
    }

    /**
     * Create a rating-type question.
     */
    public function rating(): static
    {
        return $this->state(fn (array $attributes) => [
            'question_type' => 'rating',
            'options' => json_encode(['min' => 1, 'max' => 5]),
        ]);
    }
}
