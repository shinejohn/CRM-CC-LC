<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Customer;
use App\Models\Service;
use App\Models\ServiceSubscription;
use App\Models\User;
use App\Services\StripeService;
use Mockery;
use Tests\TestCase;

final class SubscriptionPlanChangeTest extends TestCase
{
    private const TENANT_ID = '00000000-0000-0000-0000-000000000000';

    private ?User $actingUser = null;

    protected function setUp(): void
    {
        parent::setUp();

        // Mock Stripe so no network calls happen. Self-managed subscriptions
        // (no stripe_subscription_id) never touch these methods.
        $mock = Mockery::mock(StripeService::class);
        $mock->shouldReceive('previewProration')->andReturn(
            \Stripe\Invoice::constructFrom([
                'total' => 9900,
                'lines' => ['data' => [['amount' => 4500, 'proration' => true]]],
            ])
        );
        $mock->shouldReceive('updateSubscriptionPrice')->andReturn(
            \Stripe\Subscription::constructFrom(['id' => 'sub_test'])
        );
        $this->app->instance(StripeService::class, $mock);
    }

    private function authenticate(): void
    {
        $this->actingUser = $this->createAndAuthenticateUser();
    }

    private function makeService(float $price, ?string $tier = 'standard'): Service
    {
        return Service::factory()->create([
            'tenant_id' => self::TENANT_ID,
            'is_subscription' => true,
            'is_active' => true,
            'billing_period' => 'monthly',
            'service_tier' => $tier,
            'price' => $price,
        ]);
    }

    private function makeSubscription(Service $service, float $monthly): ServiceSubscription
    {
        $customer = Customer::factory()->create(['tenant_id' => self::TENANT_ID]);

        return ServiceSubscription::factory()->create([
            'tenant_id' => self::TENANT_ID,
            'customer_id' => $customer->id,
            'user_id' => $this->actingUser?->id,
            'service_id' => $service->id,
            'status' => 'active',
            'tier' => $service->service_tier,
            'monthly_amount' => $monthly,
            'billing_cycle' => 'monthly',
            'subscription_started_at' => now()->subDays(15),
            'subscription_expires_at' => now()->addDays(15),
        ]);
    }

    public function test_active_endpoint_returns_current_subscription(): void
    {
        $this->authenticate();

        $service = $this->makeService(49.99);
        $sub = $this->makeSubscription($service, 49.99);

        $response = $this->getJson('/api/v1/subscriptions/active');

        $response->assertStatus(200)
            ->assertJsonPath('data.id', $sub->id)
            ->assertJsonPath('data.serviceId', $service->id)
            ->assertJsonPath('data.price', 49.99)
            ->assertJsonStructure(['data' => ['id', 'serviceName', 'status', 'tier', 'billingCycle', 'nextBillingDate']]);
    }

    public function test_active_endpoint_returns_null_when_none(): void
    {
        $this->authenticate();

        $this->getJson('/api/v1/subscriptions/active')
            ->assertStatus(200)
            ->assertExactJson(['data' => null]);
    }

    public function test_prorate_preview_returns_expected_shape(): void
    {
        $this->authenticate();

        $current = $this->makeService(29.99, 'basic');
        $this->makeSubscription($current, 29.99);
        $target = $this->makeService(59.99, 'premium');

        $response = $this->getJson('/api/v1/billing/prorate?target_service_id='.$target->id);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'current_plan' => ['service_id', 'name', 'amount_cents', 'billing_cycle'],
                    'target_plan' => ['service_id', 'name', 'amount_cents', 'billing_cycle'],
                    'proration_amount_cents',
                    'next_invoice_total_cents',
                    'effective_date',
                    'stripe_preview',
                    'direction',
                ],
            ])
            ->assertJsonPath('data.direction', 'upgrade')
            ->assertJsonPath('data.target_plan.amount_cents', 5999)
            ->assertJsonPath('data.current_plan.amount_cents', 2999)
            ->assertJsonPath('data.stripe_preview', false);

        // Manual proration: upgrade with ~half the period remaining → positive amount owed.
        $this->assertGreaterThan(0, $response->json('data.proration_amount_cents'));
    }

    public function test_upgrade_changes_stored_plan_and_price(): void
    {
        $this->authenticate();

        $current = $this->makeService(29.99, 'basic');
        $sub = $this->makeSubscription($current, 29.99);
        $target = $this->makeService(59.99, 'premium');

        $response = $this->postJson("/api/v1/subscriptions/{$sub->id}/upgrade", [
            'target_service_id' => $target->id,
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.serviceId', $target->id)
            ->assertJsonPath('data.price', 59.99)
            ->assertJsonPath('proration.direction', 'upgrade');

        $sub->refresh();
        $this->assertSame($target->id, $sub->service_id);
        $this->assertSame('premium', $sub->tier);
        $this->assertSame('59.99', (string) $sub->monthly_amount);
    }

    public function test_downgrade_changes_stored_plan(): void
    {
        $this->authenticate();

        $current = $this->makeService(59.99, 'premium');
        $sub = $this->makeSubscription($current, 59.99);
        $target = $this->makeService(29.99, 'basic');

        $response = $this->postJson("/api/v1/subscriptions/{$sub->id}/downgrade", [
            'target_service_id' => $target->id,
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.serviceId', $target->id)
            ->assertJsonPath('proration.direction', 'downgrade');

        $sub->refresh();
        $this->assertSame($target->id, $sub->service_id);
    }

    public function test_upgrade_rejects_when_target_is_a_downgrade(): void
    {
        $this->authenticate();

        $current = $this->makeService(59.99, 'premium');
        $sub = $this->makeSubscription($current, 59.99);
        $target = $this->makeService(29.99, 'basic');

        $this->postJson("/api/v1/subscriptions/{$sub->id}/upgrade", [
            'target_service_id' => $target->id,
        ])->assertStatus(422);

        $sub->refresh();
        $this->assertSame($current->id, $sub->service_id);
    }

    public function test_upgrade_rejects_same_plan(): void
    {
        $this->authenticate();

        $current = $this->makeService(49.99);
        $sub = $this->makeSubscription($current, 49.99);

        $this->postJson("/api/v1/subscriptions/{$sub->id}/upgrade", [
            'target_service_id' => $current->id,
        ])->assertStatus(422);
    }

    public function test_uses_stripe_preview_when_stripe_managed(): void
    {
        $this->authenticate();

        $current = $this->makeService(29.99, 'basic');
        $customer = Customer::factory()->create(['tenant_id' => self::TENANT_ID]);
        ServiceSubscription::factory()->withStripeSubscription()->create([
            'tenant_id' => self::TENANT_ID,
            'customer_id' => $customer->id,
            'user_id' => $this->actingUser?->id,
            'service_id' => $current->id,
            'status' => 'active',
            'monthly_amount' => 29.99,
            'billing_cycle' => 'monthly',
            'subscription_expires_at' => now()->addDays(15),
        ]);

        $target = Service::factory()->create([
            'tenant_id' => self::TENANT_ID,
            'is_subscription' => true,
            'is_active' => true,
            'billing_period' => 'monthly',
            'service_tier' => 'premium',
            'price' => 59.99,
            'stripe_price_id' => 'price_target',
        ]);

        $response = $this->getJson('/api/v1/billing/prorate?target_service_id='.$target->id);

        $response->assertStatus(200)
            ->assertJsonPath('data.stripe_preview', true)
            ->assertJsonPath('data.proration_amount_cents', 4500)
            ->assertJsonPath('data.next_invoice_total_cents', 9900);
    }
}
