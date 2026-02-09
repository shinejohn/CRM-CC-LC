<?php

namespace Database\Factories;

use App\Models\Community;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Community>
 */
class CommunityFactory extends Factory
{
    protected $model = Community::class;

    public function definition(): array
    {
        $name = $this->faker->city();

        return [
            'uuid' => (string) Str::uuid(),
            'name' => $name,
            'slug' => Str::slug($name) . '-' . Str::random(6),
            'state' => $this->faker->stateAbbr(),
            'county' => $this->faker->optional()->city(),
            'population' => $this->faker->optional()->numberBetween(1000, 200000),
            'timezone' => $this->faker->timezone(),
            'settings' => [],
        ];
    }
}



