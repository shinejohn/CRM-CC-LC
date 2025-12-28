<?php

namespace Database\Factories;

use App\Models\PresentationTemplate;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\PresentationTemplate>
 */
class PresentationTemplateFactory extends Factory
{
    protected $model = PresentationTemplate::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'id' => (string) \Illuminate\Support\Str::uuid(),
            'name' => fake()->words(3, true),
            'description' => fake()->optional()->paragraph(),
            'purpose' => fake()->optional()->sentence(),
            'target_audience' => fake()->optional()->word(),
            'slides' => [
                [
                    'type' => 'hero',
                    'title' => fake()->sentence(4),
                    'content' => fake()->paragraph(),
                ],
                [
                    'type' => 'content',
                    'title' => fake()->sentence(3),
                    'content' => fake()->paragraphs(2, true),
                ],
            ],
            'audio_base_url' => fake()->optional()->url(),
            'audio_files' => null,
            'injection_points' => null,
            'default_theme' => [
                'primary_color' => fake()->hexColor(),
                'font_family' => 'Arial',
            ],
            'default_presenter_id' => fake()->optional()->uuid(),
            'estimated_duration' => fake()->numberBetween(60, 600),
            'slide_count' => 2,
            'is_active' => true,
        ];
    }

    /**
     * Indicate that the template is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }
}
