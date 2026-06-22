<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Customer;
use App\Services\StripeService;
use Mockery;
use Stripe\Collection;
use Stripe\Customer as StripeCustomer;
use Stripe\PaymentMethod;
use Stripe\SetupIntent;
use Tests\TestCase;

final class PaymentMethodApiTest extends TestCase
{
    private \App\Models\User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = $this->createAndAuthenticateUser();
    }

    private function mockStripeService(): Mockery\MockInterface
    {
        $mock = Mockery::mock(StripeService::class);
        $this->app->instance(StripeService::class, $mock);

        return $mock;
    }

    public function test_list_payment_methods_returns_empty_when_no_stripe_customer(): void
    {
        Customer::factory()->create([
            'email' => $this->user->email,
            'stripe_customer_id' => null,
        ]);

        $response = $this->getJson('/api/v1/payment-methods');

        $response->assertOk()
            ->assertJsonPath('data', []);
    }

    public function test_list_payment_methods_returns_cards(): void
    {
        Customer::factory()->create([
            'email' => $this->user->email,
            'stripe_customer_id' => 'cus_pm_test',
        ]);

        $mockCollection = Collection::constructFrom([
            'data' => [
                [
                    'id' => 'pm_test_123',
                    'object' => 'payment_method',
                    'type' => 'card',
                    'card' => [
                        'brand' => 'visa',
                        'last4' => '4242',
                        'exp_month' => 12,
                        'exp_year' => 2027,
                    ],
                    'created' => 1718000000,
                ],
            ],
        ]);

        $mock = $this->mockStripeService();
        $mock->shouldReceive('listPaymentMethods')
            ->once()
            ->with('cus_pm_test')
            ->andReturn($mockCollection);

        $response = $this->getJson('/api/v1/payment-methods');

        $response->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', 'pm_test_123')
            ->assertJsonPath('data.0.card.brand', 'visa')
            ->assertJsonPath('data.0.card.last4', '4242');
    }

    public function test_create_setup_intent(): void
    {
        Customer::factory()->create([
            'email' => $this->user->email,
            'stripe_customer_id' => 'cus_si_test',
        ]);

        $mockSetupIntent = SetupIntent::constructFrom([
            'id' => 'seti_test_123',
            'client_secret' => 'seti_test_123_secret_abc',
        ]);

        $mock = $this->mockStripeService();
        $mock->shouldReceive('createSetupIntent')
            ->once()
            ->with('cus_si_test')
            ->andReturn($mockSetupIntent);

        $response = $this->postJson('/api/v1/payment-methods/setup-intent');

        $response->assertOk()
            ->assertJsonPath('setup_intent_id', 'seti_test_123')
            ->assertJsonPath('client_secret', 'seti_test_123_secret_abc');
    }

    public function test_create_setup_intent_creates_stripe_customer_if_missing(): void
    {
        $customer = Customer::factory()->create([
            'email' => $this->user->email,
            'stripe_customer_id' => null,
        ]);

        $mockStripeCustomer = StripeCustomer::constructFrom(['id' => 'cus_new_123']);
        $mockSetupIntent = SetupIntent::constructFrom([
            'id' => 'seti_new_test',
            'client_secret' => 'seti_new_secret',
        ]);

        $mock = $this->mockStripeService();
        $mock->shouldReceive('createCustomer')
            ->once()
            ->andReturn($mockStripeCustomer);
        $mock->shouldReceive('createSetupIntent')
            ->once()
            ->with('cus_new_123')
            ->andReturn($mockSetupIntent);

        $response = $this->postJson('/api/v1/payment-methods/setup-intent');

        $response->assertOk();

        $customer->refresh();
        $this->assertSame('cus_new_123', $customer->stripe_customer_id);
    }

    public function test_destroy_payment_method(): void
    {
        Customer::factory()->create([
            'email' => $this->user->email,
            'stripe_customer_id' => 'cus_del_test',
        ]);

        $mockMethod = PaymentMethod::constructFrom([
            'id' => 'pm_del_123',
            'customer' => 'cus_del_test',
        ]);

        $mockDetached = PaymentMethod::constructFrom(['id' => 'pm_del_123']);

        $mock = $this->mockStripeService();
        $mock->shouldReceive('retrievePaymentMethod')
            ->once()
            ->with('pm_del_123')
            ->andReturn($mockMethod);
        $mock->shouldReceive('detachPaymentMethod')
            ->once()
            ->with('pm_del_123')
            ->andReturn($mockDetached);

        $response = $this->deleteJson('/api/v1/payment-methods/pm_del_123');

        $response->assertOk()
            ->assertJsonPath('message', 'Payment method removed');
    }

    public function test_destroy_rejects_other_customers_payment_method(): void
    {
        Customer::factory()->create([
            'email' => $this->user->email,
            'stripe_customer_id' => 'cus_owner',
        ]);

        $mockMethod = PaymentMethod::constructFrom([
            'id' => 'pm_other_123',
            'customer' => 'cus_different_person',
        ]);

        $mock = $this->mockStripeService();
        $mock->shouldReceive('retrievePaymentMethod')
            ->once()
            ->with('pm_other_123')
            ->andReturn($mockMethod);
        $mock->shouldNotReceive('detachPaymentMethod');

        $response = $this->deleteJson('/api/v1/payment-methods/pm_other_123');

        $response->assertForbidden();
    }

    public function test_set_default_payment_method(): void
    {
        Customer::factory()->create([
            'email' => $this->user->email,
            'stripe_customer_id' => 'cus_default_test',
        ]);

        $mockMethod = PaymentMethod::constructFrom([
            'id' => 'pm_default_123',
            'customer' => 'cus_default_test',
        ]);

        $mockCustomer = StripeCustomer::constructFrom(['id' => 'cus_default_test']);

        $mock = $this->mockStripeService();
        $mock->shouldReceive('retrievePaymentMethod')
            ->once()
            ->with('pm_default_123')
            ->andReturn($mockMethod);
        $mock->shouldReceive('setDefaultPaymentMethod')
            ->once()
            ->with('cus_default_test', 'pm_default_123')
            ->andReturn($mockCustomer);

        $response = $this->postJson('/api/v1/payment-methods/default', [
            'payment_method_id' => 'pm_default_123',
        ]);

        $response->assertOk()
            ->assertJsonPath('message', 'Default payment method updated');
    }

    public function test_returns_404_when_no_customer_for_user(): void
    {
        $response = $this->getJson('/api/v1/payment-methods');
        $response->assertNotFound();
    }
}
