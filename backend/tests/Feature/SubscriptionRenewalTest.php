<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Jobs\RenewExpiredSubscriptions;
use App\Jobs\SendPaymentReminder;
use App\Models\Customer;
use App\Models\Service;
use App\Models\ServiceSubscription;
use App\Services\StripeService;
use Illuminate\Support\Facades\Queue;
use Mockery;
use Stripe\PaymentIntent;
use Tests\TestCase;

final class SubscriptionRenewalTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        Queue::fake();
    }

    private function mockStripeService(): Mockery\MockInterface
    {
        $mock = Mockery::mock(StripeService::class);
        $this->app->instance(StripeService::class, $mock);

        return $mock;
    }

    private function fakePaymentIntent(string $status = 'succeeded', string $id = 'pi_test'): PaymentIntent
    {
        return PaymentIntent::constructFrom(['id' => $id, 'status' => $status]);
    }

    public function test_renews_expired_self_managed_subscription(): void
    {
        $customer = Customer::factory()->create([
            'stripe_customer_id' => 'cus_test123',
        ]);
        $service = Service::factory()->create(['is_subscription' => true]);

        $sub = ServiceSubscription::factory()->expired()->create([
            'customer_id' => $customer->id,
            'service_id' => $service->id,
            'monthly_amount' => 49.99,
            'billing_cycle' => 'monthly',
        ]);

        $mock = $this->mockStripeService();
        $mock->shouldReceive('createPaymentIntent')
            ->once()
            ->withArgs(fn ($amount) => $amount === 4999)
            ->andReturnUsing(fn () => $this->fakePaymentIntent());

        $job = new RenewExpiredSubscriptions();
        $job->handle($mock);

        $sub->refresh();
        $this->assertSame('active', $sub->status);
        $this->assertSame(0, $sub->renewal_attempts);
        $this->assertNull($sub->renewal_failure_reason);
        $this->assertTrue($sub->subscription_expires_at->isFuture());
    }

    public function test_skips_stripe_managed_subscriptions(): void
    {
        $customer = Customer::factory()->create();
        $service = Service::factory()->create(['is_subscription' => true]);

        ServiceSubscription::factory()->expired()->withStripeSubscription()->create([
            'customer_id' => $customer->id,
            'service_id' => $service->id,
        ]);

        $mock = $this->mockStripeService();
        $mock->shouldNotReceive('createPaymentIntent');

        $job = new RenewExpiredSubscriptions();
        $job->handle($mock);
    }

    public function test_skips_cancelled_subscriptions(): void
    {
        $customer = Customer::factory()->create();
        $service = Service::factory()->create(['is_subscription' => true]);

        ServiceSubscription::factory()->expired()->cancelled()->create([
            'customer_id' => $customer->id,
            'service_id' => $service->id,
        ]);

        $mock = $this->mockStripeService();
        $mock->shouldNotReceive('createPaymentIntent');

        $job = new RenewExpiredSubscriptions();
        $job->handle($mock);
    }

    public function test_skips_auto_renew_disabled(): void
    {
        $customer = Customer::factory()->create();
        $service = Service::factory()->create(['is_subscription' => true]);

        ServiceSubscription::factory()->expired()->create([
            'customer_id' => $customer->id,
            'service_id' => $service->id,
            'auto_renew' => false,
        ]);

        $mock = $this->mockStripeService();
        $mock->shouldNotReceive('createPaymentIntent');

        $job = new RenewExpiredSubscriptions();
        $job->handle($mock);
    }

    public function test_suspends_after_max_attempts(): void
    {
        $customer = Customer::factory()->create([
            'stripe_customer_id' => 'cus_test456',
        ]);
        $service = Service::factory()->create(['is_subscription' => true]);

        $sub = ServiceSubscription::factory()->expired()->create([
            'customer_id' => $customer->id,
            'service_id' => $service->id,
            'monthly_amount' => 29.99,
            'renewal_attempts' => 2,
        ]);

        $mock = $this->mockStripeService();
        $mock->shouldReceive('createPaymentIntent')
            ->once()
            ->andThrow(new \Exception('Card declined'));

        $job = new RenewExpiredSubscriptions();
        $job->handle($mock);

        $sub->refresh();
        $this->assertSame('suspended', $sub->status);
        $this->assertSame(3, $sub->renewal_attempts);
        $this->assertStringContainsString('Card declined', $sub->renewal_failure_reason);

        Queue::assertPushed(SendPaymentReminder::class);
    }

    public function test_dispatches_payment_reminder_when_no_stripe_customer(): void
    {
        $customer = Customer::factory()->create([
            'stripe_customer_id' => null,
        ]);
        $service = Service::factory()->create(['is_subscription' => true]);

        $sub = ServiceSubscription::factory()->expired()->create([
            'customer_id' => $customer->id,
            'service_id' => $service->id,
            'monthly_amount' => 19.99,
            'stripe_customer_id' => null,
        ]);

        $mock = $this->mockStripeService();
        $mock->shouldNotReceive('createPaymentIntent');

        $job = new RenewExpiredSubscriptions();
        $job->handle($mock);

        $sub->refresh();
        // A subscription with no Stripe customer is skipped (reminder sent) and
        // does NOT increment renewal_attempts — it is not a failed charge.
        $this->assertSame(0, $sub->renewal_attempts);
        $this->assertStringContainsString('No Stripe customer ID', $sub->renewal_failure_reason);

        Queue::assertPushed(SendPaymentReminder::class, function ($job) {
            return $job->reason === 'missing_payment_method';
        });
    }

    public function test_free_subscription_auto_renews_without_payment(): void
    {
        $customer = Customer::factory()->create();
        $service = Service::factory()->create(['is_subscription' => true, 'price' => 0]);

        $sub = ServiceSubscription::factory()->expired()->create([
            'customer_id' => $customer->id,
            'service_id' => $service->id,
            'monthly_amount' => 0,
        ]);

        $mock = $this->mockStripeService();
        $mock->shouldNotReceive('createPaymentIntent');

        $job = new RenewExpiredSubscriptions();
        $job->handle($mock);

        $sub->refresh();
        $this->assertSame('active', $sub->status);
        $this->assertTrue($sub->subscription_expires_at->isFuture());
    }

    public function test_annual_subscription_extends_by_year(): void
    {
        $customer = Customer::factory()->create([
            'stripe_customer_id' => 'cus_annual',
        ]);
        $service = Service::factory()->create([
            'is_subscription' => true,
            'billing_period' => 'annual',
        ]);

        $sub = ServiceSubscription::factory()->expired()->create([
            'customer_id' => $customer->id,
            'service_id' => $service->id,
            'monthly_amount' => 99.99,
            'billing_cycle' => 'annual',
        ]);

        $mock = $this->mockStripeService();
        $mock->shouldReceive('createPaymentIntent')
            ->once()
            ->withArgs(fn ($amount) => $amount === 119988)  // 99.99 * 12 * 100
            ->andReturnUsing(fn () => $this->fakePaymentIntent());

        $job = new RenewExpiredSubscriptions();
        $job->handle($mock);

        $sub->refresh();
        $this->assertTrue($sub->subscription_expires_at->gt(now()->addMonths(11)));
    }

    public function test_does_not_renew_non_expired_subscriptions(): void
    {
        $customer = Customer::factory()->create();
        $service = Service::factory()->create(['is_subscription' => true]);

        ServiceSubscription::factory()->create([
            'customer_id' => $customer->id,
            'service_id' => $service->id,
            'subscription_expires_at' => now()->addDays(15),
        ]);

        $mock = $this->mockStripeService();
        $mock->shouldNotReceive('createPaymentIntent');

        $job = new RenewExpiredSubscriptions();
        $job->handle($mock);
    }
}
