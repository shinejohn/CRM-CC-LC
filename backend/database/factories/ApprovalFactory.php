<?php

namespace Database\Factories;

use App\Models\Approval;
use App\Models\Customer;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Approval>
 */
class ApprovalFactory extends Factory
{
    protected $model = Approval::class;

    public function definition(): array
    {
        return [
            'customer_id' => Customer::factory(),
            'service_type' => $this->faker->randomElement(['appointment_booking', 'review_automation', 'invoice_automation']),
            'approver_name' => $this->faker->name(),
            'approver_email' => $this->faker->safeEmail(),
            'approver_phone' => $this->faker->optional()->phoneNumber(),
            'source_type' => 'learning_center',
            'source_id' => $this->faker->uuid(),
            'source_url' => $this->faker->url(),
            'contact_consent' => true,
            'status' => 'pending',
            'approved_at' => now(),
            'metadata' => [],
        ];
    }
}

