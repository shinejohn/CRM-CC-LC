<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Customer;
use App\Models\Service;
use App\Models\ServiceSubscription;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ServiceSubscription>
 */
final class ServiceSubscriptionFactory extends Factory
{
    protected $model = ServiceSubscription::class;

    public function definition(): array
    {
        return [
            'tenant_id' => '00000000-0000-0000-0000-000000000000',
            'customer_id' => Customer::factory(),
            'service_id' => Service::factory(),
            'tier' => fake()->randomElement(['basic', 'standard', 'premium']),
            'status' => 'active',
            'subscription_started_at' => now()->subMonth(),
            'subscription_expires_at' => now()->addMonth(),
            'auto_renew' => true,
            'monthly_amount' => fake()->randomFloat(2, 9.99, 299.99),
            'billing_cycle' => 'monthly',
            'renewal_attempts' => 0,
        ];
    }

    public function expired(): static
    {
        return $this->state(fn () => [
            'subscription_expires_at' => now()->subDay(),
        ]);
    }

    public function expiringSoon(): static
    {
        return $this->state(fn () => [
            'subscription_expires_at' => now()->addHours(12),
        ]);
    }

    public function cancelled(): static
    {
        return $this->state(fn () => [
            'status' => 'cancelled',
            'cancelled_at' => now(),
            'auto_renew' => false,
        ]);
    }

    public function suspended(): static
    {
        return $this->state(fn () => [
            'status' => 'suspended',
            'renewal_attempts' => 3,
            'renewal_failure_reason' => 'Max renewal attempts reached',
        ]);
    }

    public function withStripeSubscription(): static
    {
        return $this->state(fn () => [
            'stripe_subscription_id' => 'sub_' . fake()->sha1(),
            'stripe_customer_id' => 'cus_' . fake()->sha1(),
        ]);
    }

    public function annual(): static
    {
        return $this->state(fn () => [
            'billing_cycle' => 'annual',
            'subscription_expires_at' => now()->addYear(),
        ]);
    }

    public function trial(): static
    {
        return $this->state(fn () => [
            'tier' => 'trial',
            'trial_started_at' => now(),
            'trial_expires_at' => now()->addDays(14),
        ]);
    }
}
