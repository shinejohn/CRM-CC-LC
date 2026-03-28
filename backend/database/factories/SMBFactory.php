<?php

namespace Database\Factories;

use App\Models\Community;
use App\Models\SMB;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class SMBFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = SMB::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'uuid' => (string) Str::uuid(),
            'business_name' => $this->faker->company,
            'community_id' => Community::factory(),
            'engagement_tier' => 1,
            'campaign_status' => 'standby',
        ];
    }
}
