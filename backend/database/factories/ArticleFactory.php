<?php

namespace Database\Factories;

use App\Models\Article;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Article>
 */
class ArticleFactory extends Factory
{
    protected $model = Article::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $title = fake()->sentence(4);
        $slug = Str::slug($title) . '-' . fake()->unique()->randomNumber(4);

        return [
            'tenant_id' => '00000000-0000-0000-0000-000000000000',
            'title' => $title,
            'slug' => $slug,
            'excerpt' => fake()->optional()->sentence(),
            'content' => fake()->paragraphs(5, true),
            'featured_image' => fake()->optional()->imageUrl(),
            'category' => fake()->optional()->word(),
            'status' => fake()->randomElement(['draft', 'published', 'archived']),
            'published_at' => fake()->optional()->dateTime(),
            'is_ai_generated' => fake()->boolean(30),
            'view_count' => fake()->numberBetween(0, 10000),
            'created_by' => fake()->optional()->uuid(),
        ];
    }

    /**
     * Indicate that the article is published.
     */
    public function published(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'published',
            'published_at' => now(),
        ]);
    }

    /**
     * Indicate that the article is a draft.
     */
    public function draft(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'draft',
            'published_at' => null,
        ]);
    }

    /**
     * Indicate that the article is AI-generated.
     */
    public function aiGenerated(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_ai_generated' => true,
        ]);
    }
}
