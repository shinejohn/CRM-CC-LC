<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Jobs\SendPaymentReminder;
use App\Models\Customer;
use App\Models\Service;
use App\Models\ServiceSubscription;
use Illuminate\Support\Facades\Queue;
use Tests\Concerns\SignsStripeWebhooks;
use Tests\TestCase;

final class DunningTest extends TestCase
{
    use SignsStripeWebhooks;

    public function test_invoice_payment_failed_webhook_increments_renewal_attempts(): void
    {
        Queue::fake();

        $customer = Customer::factory()->create();
        $service = Service::factory()->create(['is_subscription' => true]);

        $sub = ServiceSubscription::factory()->create([
            'customer_id' => $customer->id,
            'service_id' => $service->id,
            'stripe_subscription_id' => 'sub_dunning_test',
            'renewal_attempts' => 0,
        ]);

        $payload = [
            'id' => 'evt_dunning_fail_1',
            'type' => 'invoice.payment_failed',
            'data' => [
                'object' => [
                    'id' => 'in_test_fail',
                    'subscription' => 'sub_dunning_test',
                ],
            ],
        ];

        $response = $this->postSignedStripeWebhook($payload);
        $response->assertOk();

        $sub->refresh();
        $this->assertSame(1, $sub->renewal_attempts);
        $this->assertNotNull($sub->last_renewal_attempt_at);
        $this->assertSame('active', $sub->status);

        Queue::assertPushed(SendPaymentReminder::class, function ($job) {
            return $job->reason === 'payment_failed';
        });
    }

    public function test_third_failure_suspends_subscription(): void
    {
        Queue::fake();

        $customer = Customer::factory()->create();
        $service = Service::factory()->create(['is_subscription' => true]);

        $sub = ServiceSubscription::factory()->create([
            'customer_id' => $customer->id,
            'service_id' => $service->id,
            'stripe_subscription_id' => 'sub_dunning_suspend',
            'renewal_attempts' => 2,
        ]);

        $payload = [
            'id' => 'evt_dunning_fail_3',
            'type' => 'invoice.payment_failed',
            'data' => [
                'object' => [
                    'id' => 'in_test_fail_3',
                    'subscription' => 'sub_dunning_suspend',
                ],
            ],
        ];

        $response = $this->postSignedStripeWebhook($payload);
        $response->assertOk();

        $sub->refresh();
        $this->assertSame(3, $sub->renewal_attempts);
        $this->assertSame('suspended', $sub->status);
    }

    public function test_invoice_payment_succeeded_resets_attempts_and_extends(): void
    {
        $customer = Customer::factory()->create();
        $service = Service::factory()->create(['is_subscription' => true]);

        $sub = ServiceSubscription::factory()->create([
            'customer_id' => $customer->id,
            'service_id' => $service->id,
            'stripe_subscription_id' => 'sub_dunning_success',
            'renewal_attempts' => 2,
            'renewal_failure_reason' => 'Previous failure',
            'subscription_expires_at' => now()->subDay(),
        ]);

        $periodEnd = now()->addMonth()->getTimestamp();

        $payload = [
            'id' => 'evt_dunning_success_1',
            'type' => 'invoice.payment_succeeded',
            'data' => [
                'object' => [
                    'id' => 'in_test_success',
                    'subscription' => 'sub_dunning_success',
                    'lines' => [
                        'data' => [
                            [
                                'period' => [
                                    'end' => $periodEnd,
                                ],
                            ],
                        ],
                    ],
                ],
            ],
        ];

        $response = $this->postSignedStripeWebhook($payload);
        $response->assertOk();

        $sub->refresh();
        $this->assertSame(0, $sub->renewal_attempts);
        $this->assertNull($sub->renewal_failure_reason);
        $this->assertSame('active', $sub->status);
        $this->assertTrue($sub->subscription_expires_at->isFuture());
    }

    public function test_invoice_payment_succeeded_ignores_non_subscription_invoices(): void
    {
        $payload = [
            'id' => 'evt_no_sub_1',
            'type' => 'invoice.payment_succeeded',
            'data' => [
                'object' => [
                    'id' => 'in_no_sub',
                    'subscription' => null,
                ],
            ],
        ];

        $response = $this->postSignedStripeWebhook($payload);
        $response->assertOk();
    }

    public function test_payment_reminder_email_is_dispatched(): void
    {
        Queue::fake();

        $customer = Customer::factory()->create([
            'email' => 'dunning@example.com',
        ]);
        $service = Service::factory()->create(['is_subscription' => true, 'name' => 'Pro Plan']);

        $sub = ServiceSubscription::factory()->create([
            'customer_id' => $customer->id,
            'service_id' => $service->id,
            'monthly_amount' => 49.99,
            'renewal_attempts' => 1,
        ]);

        SendPaymentReminder::dispatch($sub, 'payment_failed');

        Queue::assertPushed(SendPaymentReminder::class, function ($job) use ($sub) {
            return $job->subscription->id === $sub->id
                && $job->reason === 'payment_failed';
        });
    }
}
