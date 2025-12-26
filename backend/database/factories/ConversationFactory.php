<?php

namespace Database\Factories;

use App\Models\Conversation;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Conversation>
 */
class ConversationFactory extends Factory
{
    protected $model = Conversation::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'id' => (string) Str::uuid(),
            'tenant_id' => (string) Str::uuid(),
            'session_id' => 'session_' . Str::random(32),
            'entry_point' => $this->faker->randomElement(['presentation', 'chat_widget', 'phone', 'sms']),
            'template_id' => $this->faker->randomElement(['intro', 'pricing', 'features']),
            'messages' => [],
            'started_at' => now(),
        ];
    }
}
