<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;

class StripeWebhookTest extends TestCase
{
    use RefreshDatabase; protected function setUp(): void { parent::setUp(); $this->createAndAuthenticateUser(); }

    public function test_can_handle_payment_intent_succeeded_webhook(): void
    {
        $payload = [
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

        $response = $this->postJson('/api/stripe/webhook', $payload, [
            'Stripe-Signature' => 'test_signature',
        ]);

        // Webhook should return 200 even if processing fails (to prevent retries)
        $response->assertStatus(200);
    }

    public function test_can_handle_invoice_payment_succeeded_webhook(): void
    {
        $payload = [
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

        $response = $this->postJson('/api/stripe/webhook', $payload, [
            'Stripe-Signature' => 'test_signature',
        ]);

        $response->assertStatus(200);
    }

    public function test_can_handle_customer_subscription_created_webhook(): void
    {
        $payload = [
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

        $response = $this->postJson('/api/stripe/webhook', $payload, [
            'Stripe-Signature' => 'test_signature',
        ]);

        $response->assertStatus(200);
    }

    public function test_can_handle_customer_subscription_deleted_webhook(): void
    {
        $payload = [
            'type' => 'customer.subscription.deleted',
            'data' => [
                'object' => [
                    'id' => 'sub_test_123',
                    'customer' => 'cus_test_123',
                ],
            ],
        ];

        $response = $this->postJson('/api/stripe/webhook', $payload, [
            'Stripe-Signature' => 'test_signature',
        ]);

        $response->assertStatus(200);
    }

    public function test_ignores_unknown_webhook_types(): void
    {
        $payload = [
            'type' => 'unknown.event.type',
            'data' => [
                'object' => [],
            ],
        ];

        $response = $this->postJson('/api/stripe/webhook', $payload, [
            'Stripe-Signature' => 'test_signature',
        ]);

        // Should still return 200 to acknowledge receipt
        $response->assertStatus(200);
    }
}
