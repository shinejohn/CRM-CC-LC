<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\GeneratedContent;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

final class GeneratedContentFactory extends Factory
{
    protected $model = GeneratedContent::class;

    public function definition(): array
    {
        return [
            'tenant_id' => '00000000-0000-0000-0000-000000000000',
            'title' => fake()->sentence(),
            'slug' => fake()->slug(),
            'type' => fake()->randomElement(['article', 'blog', 'social']),
            'status' => 'draft',
            'content' => fake()->paragraphs(3, true),
            'excerpt' => fake()->sentence(),
            'metadata' => [],
        ];
    }
}
