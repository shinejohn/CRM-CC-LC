<?php

declare(strict_types=1);

namespace Tests\Concerns;

use Illuminate\Testing\TestResponse;

/**
 * Helper for exercising the Stripe webhook endpoint with a *validly signed*
 * payload.
 *
 * The controller fails closed: it rejects any request whose body does not carry
 * a valid `Stripe-Signature` header verified against
 * `config('services.stripe.webhook_secret')` via
 * `\Stripe\Webhook::constructEvent($payload, $sigHeader, $secret)`. Stripe's
 * scheme is `t=<timestamp>,v1=<hmac_sha256("$t.$payload", $secret)>` computed
 * over the *raw* request body.
 *
 * We therefore json_encode the payload ONCE and send that exact byte string as
 * the request body (via ->call(), not ->postJson(), which would re-encode and
 * invalidate the signature).
 */
trait SignsStripeWebhooks
{
    protected string $stripeTestSecret = 'whsec_test123';

    /**
     * Post a signed Stripe webhook event to the endpoint.
     *
     * @param  array<string, mixed>  $payload  Must include a top-level `id` and `type`.
     */
    protected function postSignedStripeWebhook(array $payload): TestResponse
    {
        config(['services.stripe.webhook_secret' => $this->stripeTestSecret]);

        $rawJson = json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);

        // Use the current time: Stripe's constructEvent enforces a 300s
        // tolerance against the signature timestamp, so a hard-coded past
        // timestamp would be rejected as "outside the tolerance zone".
        $timestamp = time();
        $signedPayload = $timestamp.'.'.$rawJson;
        $signature = hash_hmac('sha256', $signedPayload, $this->stripeTestSecret);
        $sigHeader = "t={$timestamp},v1={$signature}";

        return $this->call(
            'POST',
            '/api/stripe/webhook',
            [],
            [],
            [],
            [
                'HTTP_STRIPE_SIGNATURE' => $sigHeader,
                'CONTENT_TYPE' => 'application/json',
                'HTTP_ACCEPT' => 'application/json',
            ],
            $rawJson,
        );
    }
}
