<?php

namespace Tests\Feature;

use Tests\Concerns\SignsStripeWebhooks;
use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

class StripeWebhookTest extends TestCase
{
    use RefreshDatabase;
    use SignsStripeWebhooks;

    protected function setUp(): void { parent::setUp(); $this->createAndAuthenticateUser(); }

    public function test_can_handle_payment_intent_succeeded_webhook(): void
    {
        $payload = [
            'id' => 'evt_pi_succeeded_1',
            'type' => 'payment_intent.succeeded',
            'data' => [
                'object' => [
                    'id' => 'pi_test_123',
                    'amount' => 1000,
                    'currency' => 'usd',
                    'customer' => 'cus_test_123',
                    'metadata' => [
                        'order_id' => 'order_test_123',
                    ],
                ],
            ],
        ];

        $response = $this->postSignedStripeWebhook($payload);

        // Webhook should return 200 even if processing fails (to prevent retries)
        $response->assertStatus(200);
    }

    public function test_can_handle_invoice_payment_succeeded_webhook(): void
    {
        $payload = [
            'id' => 'evt_in_succeeded_1',
            'type' => 'invoice.payment_succeeded',
            'data' => [
                'object' => [
                    'id' => 'in_test_123',
                    'customer' => 'cus_test_123',
                    'amount_paid' => 1000,
                    'subscription' => 'sub_test_123',
                ],
            ],
        ];

        $response = $this->postSignedStripeWebhook($payload);

        $response->assertStatus(200);
    }

    public function test_can_handle_customer_subscription_created_webhook(): void
    {
        $payload = [
            'id' => 'evt_sub_created_1',
            'type' => 'customer.subscription.created',
            'data' => [
                'object' => [
                    'id' => 'sub_test_123',
                    'customer' => 'cus_test_123',
                    'status' => 'active',
                    'items' => [
                        'data' => [
                            [
                                'price' => [
                                    'id' => 'price_test_123',
                                ],
                            ],
                        ],
                    ],
                ],
            ],
        ];

        $response = $this->postSignedStripeWebhook($payload);

        $response->assertStatus(200);
    }

    public function test_can_handle_customer_subscription_deleted_webhook(): void
    {
        $payload = [
            'id' => 'evt_sub_deleted_1',
            'type' => 'customer.subscription.deleted',
            'data' => [
                'object' => [
                    'id' => 'sub_test_123',
                    'customer' => 'cus_test_123',
                ],
            ],
        ];

        $response = $this->postSignedStripeWebhook($payload);

        $response->assertStatus(200);
    }

    public function test_ignores_unknown_webhook_types(): void
    {
        $payload = [
            'id' => 'evt_unknown_1',
            'type' => 'unknown.event.type',
            'data' => [
                'object' => [],
            ],
        ];

        $response = $this->postSignedStripeWebhook($payload);

        // Should still return 200 to acknowledge receipt
        $response->assertStatus(200);
    }
}
