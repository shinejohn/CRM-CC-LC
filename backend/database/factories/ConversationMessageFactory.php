<?php

namespace Database\Factories;

use App\Models\ConversationMessage;
use App\Models\Conversation;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ConversationMessage>
 */
class ConversationMessageFactory extends Factory
{
    protected $model = ConversationMessage::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'id' => (string) Str::uuid(),
            'conversation_id' => Conversation::factory(),
            'role' => $this->faker->randomElement(['user', 'assistant', 'system']),
            'content' => $this->faker->sentence(),
            'timestamp' => now(),
        ];
    }
}
