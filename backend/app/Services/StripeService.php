<?php

namespace App\Services;

use Exception;
use Illuminate\Support\Facades\Log;
use Stripe\Checkout\Session;
use Stripe\PaymentIntent;
use Stripe\Stripe;
use Stripe\StripeClient;

class StripeService
{
    private StripeClient $stripe;

    public function __construct()
    {
        $apiKey = config('services.stripe.secret');
        if (!$apiKey) {
            throw new Exception('Stripe API key not configured');
        }
        Stripe::setApiKey($apiKey);
        $this->stripe = new StripeClient($apiKey);
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
}
