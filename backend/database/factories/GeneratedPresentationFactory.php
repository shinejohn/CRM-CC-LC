<?php

namespace Database\Factories;

use App\Models\GeneratedPresentation;
use App\Models\PresentationTemplate;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\GeneratedPresentation>
 */
class GeneratedPresentationFactory extends Factory
{
    protected $model = GeneratedPresentation::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'template_id' => PresentationTemplate::factory(),
            'tenant_id' => '00000000-0000-0000-0000-000000000000',
            'customer_id' => null,
            'presentation_json' => [
                'title' => fake()->sentence(4),
                'slides' => [
                    [
                        'type' => 'hero',
                        'title' => fake()->sentence(4),
                        'content' => fake()->paragraph(),
                    ],
                ],
            ],
            'audio_base_url' => fake()->optional()->url(),
            'audio_generated' => false,
            'audio_generated_at' => null,
            'input_hash' => null,
            'expires_at' => fake()->optional()->dateTimeBetween('now', '+30 days'),
            'view_count' => 0,
            'avg_completion_rate' => null,
            'last_viewed_at' => null,
        ];
    }

    /**
     * Indicate that the presentation audio is generated.
     */
    public function withAudio(): static
    {
        return $this->state(fn (array $attributes) => [
            'audio_generated' => true,
            'audio_generated_at' => now(),
            'audio_base_url' => fake()->url() . '/audio/',
        ]);
    }
}
