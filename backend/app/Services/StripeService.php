<?php

declare(strict_types=1);

namespace App\Services;

use Exception;
use Illuminate\Support\Facades\Log;
use Stripe\Checkout\Session;
use Stripe\PaymentIntent;
use Stripe\Stripe;
use Stripe\StripeClient;

class StripeService
{
    private ?StripeClient $stripe = null;

    public function __construct()
    {
        $apiKey = config('services.stripe.secret');
        if ($apiKey) {
            Stripe::setApiKey($apiKey);
            $this->stripe = new StripeClient($apiKey);
        }
    }

    /**
     * Create a checkout session for services
     */
    public function createCheckoutSession(array $lineItems, string $successUrl, string $cancelUrl, array $metadata = []): Session
    {
        try {
            $sessionData = [
                'mode' => 'payment',
                'line_items' => $lineItems,
                'success_url' => $successUrl,
                'cancel_url' => $cancelUrl,
            ];

            if (!empty($metadata)) {
                $sessionData['metadata'] = $metadata;
            }

            return $this->stripe->checkout->sessions->create($sessionData);
        } catch (Exception $e) {
            Log::error('Stripe checkout session creation failed: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Create a payment intent for direct charges
     */
    public function createPaymentIntent(int $amount, string $currency = 'usd', array $metadata = []): PaymentIntent
    {
        try {
            return $this->stripe->paymentIntents->create([
                'amount' => $amount,
                'currency' => $currency,
                'metadata' => $metadata,
            ]);
        } catch (Exception $e) {
            Log::error('Stripe payment intent creation failed: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Retrieve a checkout session
     */
    public function retrieveCheckoutSession(string $sessionId): Session
    {
        return $this->stripe->checkout->sessions->retrieve($sessionId);
    }

    /**
     * Retrieve a payment intent
     */
    public function retrievePaymentIntent(string $paymentIntentId): PaymentIntent
    {
        return $this->stripe->paymentIntents->retrieve($paymentIntentId);
    }

    /**
     * Create a Stripe customer
     */
    public function createCustomer(string $email, string $name, array $metadata = []): \Stripe\Customer
    {
        try {
            return $this->stripe->customers->create([
                'email' => $email,
                'name' => $name,
                'metadata' => $metadata,
            ]);
        } catch (Exception $e) {
            Log::error('Stripe customer creation failed: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Create a Stripe subscription
     */
    public function createSubscription(string $customerId, string $priceId, array $metadata = []): \Stripe\Subscription
    {
        try {
            $data = [
                'customer' => $customerId,
                'items' => [
                    ['price' => $priceId],
                ],
                'payment_behavior' => 'default_incomplete',
                'payment_settings' => ['save_default_payment_method' => 'on_subscription'],
                'expand' => ['latest_invoice.payment_intent'],
            ];

            if (!empty($metadata)) {
                $data['metadata'] = $metadata;
            }

            return $this->stripe->subscriptions->create($data);
        } catch (Exception $e) {
            Log::error('Stripe subscription creation failed: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Cancel a Stripe subscription
     */
    public function cancelSubscription(string $subscriptionId): \Stripe\Subscription
    {
        try {
            return $this->stripe->subscriptions->cancel($subscriptionId);
        } catch (Exception $e) {
            Log::error('Stripe subscription cancellation failed: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Create a SetupIntent for saving payment methods
     */
    public function createSetupIntent(string $customerId, array $options = []): \Stripe\SetupIntent
    {
        try {
            return $this->stripe->setupIntents->create(array_merge([
                'customer' => $customerId,
                'payment_method_types' => ['card'],
            ], $options));
        } catch (Exception $e) {
            Log::error('Stripe SetupIntent creation failed: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * List payment methods for a customer
     */
    public function listPaymentMethods(string $customerId, string $type = 'card'): \Stripe\Collection
    {
        try {
            return $this->stripe->customers->allPaymentMethods($customerId, [
                'type' => $type,
            ]);
        } catch (Exception $e) {
            Log::error('Stripe list payment methods failed: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Retrieve a single payment method
     */
    public function retrievePaymentMethod(string $paymentMethodId): \Stripe\PaymentMethod
    {
        try {
            return $this->stripe->paymentMethods->retrieve($paymentMethodId);
        } catch (Exception $e) {
            Log::error('Stripe retrieve payment method failed: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Detach a payment method from its customer
     */
    public function detachPaymentMethod(string $paymentMethodId): \Stripe\PaymentMethod
    {
        try {
            return $this->stripe->paymentMethods->detach($paymentMethodId);
        } catch (Exception $e) {
            Log::error('Stripe detach payment method failed: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Set the default payment method for a customer
     */
    public function setDefaultPaymentMethod(string $customerId, string $paymentMethodId): \Stripe\Customer
    {
        try {
            return $this->stripe->customers->update($customerId, [
                'invoice_settings' => [
                    'default_payment_method' => $paymentMethodId,
                ],
            ]);
        } catch (Exception $e) {
            Log::error('Stripe set default payment method failed: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Retrieve a Stripe customer
     */
    public function retrieveCustomer(string $customerId): \Stripe\Customer
    {
        try {
            return $this->stripe->customers->retrieve($customerId);
        } catch (Exception $e) {
            Log::error('Stripe retrieve customer failed: ' . $e->getMessage());
            throw $e;
        }
    }
}
