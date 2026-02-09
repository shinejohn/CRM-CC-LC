<?php

namespace App\Services;

use App\Models\ServiceSubscription;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PublishingPlatformService
{
    /**
     * Provision a subscription on the Publishing Platform (Day News).
     *
     * @param ServiceSubscription $subscription
     * @return array Response data from the publishing platform
     */
    public function provisionSubscription(ServiceSubscription $subscription): array
    {
        $publishingUrl = config('services.publishing_platform.url', 'http://daynews.test'); // Default to local
        $endpoint = $publishingUrl . '/api/v1/provision/subscription';

        // Map CRM tier to Publishing tier
        $tierMapping = [
            'basic' => 'standard', // Example mapping
            'premium' => 'premium',
            'enterprise' => 'enterprise',
            'trial' => 'trial'
        ];

        $planTier = $tierMapping[$subscription->tier] ?? 'standard';

        $payload = [
            'email' => $subscription->customer->email ?? $subscription->user->email,
            'business_name' => $subscription->customer->business_name ?? 'My Business',
            'crm_order_id' => (string) $subscription->order_id,
            'plan_tier' => $planTier,
            'subscription_id' => (string) $subscription->id,
            'stripe_subscription_id' => $subscription->stripe_subscription_id,
            'started_at' => $subscription->subscription_started_at?->toIso8601String() ?? now()->toIso8601String(),
            'expires_at' => $subscription->subscription_expires_at?->toIso8601String() ?? now()->addMonth()->toIso8601String(),
        ];

        try {
            // Note: In a real environment, you might use Http::withHeaders(...)
            // For now, we are simulating the call if the URL is localhost or test

            // Log payload for debugging
            Log::info("Pushing subscription to Publishing Platform", ['endpoint' => $endpoint, 'payload' => $payload]);

            // If we are in development and cross-service communication isn't set up perfectly (e.g. DNS),
            // we might want to just log it. But let's try to make the request.
            // Assumption: The 'Day-News' app is reachable via the configured URL.

            // To ensure 100% success in this specific "Same Machine" context, 
            // the user might need to run both apps.
            // But implementing the client specifically:

            $response = Http::withHeaders([
                'X-Provisioning-Secret' => config('services.publishing_platform.secret', 'fibonacco-provisioning-secret-2026'),
                'Accept' => 'application/json',
            ])->post($endpoint, $payload);

            if ($response->successful()) {
                Log::info("Successfully provisioned subscription to Publishing Platform: " . $response->body());
                return $response->json();
            } else {
                Log::error("Failed to provision subscription: " . $response->status() . " " . $response->body());
                throw new \Exception("Publishing Platform Error: " . $response->body());
            }

        } catch (\Exception $e) {
            Log::error("Connection error provisioning subscription: " . $e->getMessage());
            // Depending on requirements, we might throw or queue for retry.
            // For now, let's allow it to fail gracefully but log heavily.
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }
}
