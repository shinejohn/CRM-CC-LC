<?php

namespace Database\Factories;

use App\Models\Knowledge;
use App\Models\FaqCategory;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Knowledge>
 */
class KnowledgeFactory extends Factory
{
    protected $model = Knowledge::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'tenant_id' => '00000000-0000-0000-0000-000000000000',
            'title' => fake()->sentence(4),
            'content' => fake()->paragraphs(3, true),
            'category' => fake()->word(),
            'subcategory' => fake()->optional()->word(),
            'industry_codes' => fake()->optional()->randomElements(['tech', 'retail', 'healthcare', 'finance'], rand(1, 2)),
            'embedding_status' => fake()->randomElement(['pending', 'processing', 'completed', 'failed']),
            'embedding' => null, // pgvector - typically null in factory
            'is_public' => fake()->boolean(80),
            'allowed_agents' => null,
            'source' => fake()->randomElement(['manual', 'import', 'api']),
            'source_url' => fake()->optional()->url(),
            'validation_status' => fake()->randomElement(['pending', 'approved', 'rejected']),
            'validated_at' => fake()->optional()->dateTime(),
            'validated_by' => fake()->optional()->uuid(),
            'usage_count' => fake()->numberBetween(0, 1000),
            'helpful_count' => fake()->numberBetween(0, 100),
            'not_helpful_count' => fake()->numberBetween(0, 20),
            'tags' => fake()->optional()->randomElements(['tag1', 'tag2', 'tag3', 'tag4'], rand(1, 3)),
            'metadata' => null,
            'created_by' => fake()->optional()->uuid(),
        ];
    }

    /**
     * Indicate that the knowledge item is public.
     */
    public function public(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_public' => true,
        ]);
    }

    /**
     * Indicate that the knowledge item is private.
     */
    public function private(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_public' => false,
        ]);
    }

    /**
     * Indicate that the knowledge item has completed embedding.
     */
    public function embedded(): static
    {
        return $this->state(fn (array $attributes) => [
            'embedding_status' => 'completed',
        ]);
    }

    /**
     * Indicate that the knowledge item is validated.
     */
    public function validated(): static
    {
        return $this->state(fn (array $attributes) => [
            'validation_status' => 'approved',
            'validated_at' => now(),
            'validated_by' => '00000000-0000-0000-0000-000000000000',
        ]);
    }
}
