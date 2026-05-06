<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\ServiceSubscription;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

final class PublishingPlatformService
{
    private function baseUrl(): string
    {
        return config('services.publishing_platform.url', 'http://daynews.test');
    }

    private function secret(): string
    {
        return config('services.publishing_platform.secret', '');
    }

    /**
     * Make an authenticated request to the Publishing Platform.
     *
     * @return array<string, mixed>
     */
    private function request(string $method, string $path, array $payload = []): array
    {
        $url = $this->baseUrl() . $path;

        try {
            Log::info("PublishingPlatform {$method} {$path}", ['payload_keys' => array_keys($payload)]);

            $http = Http::withHeaders([
                'X-Provisioning-Secret' => $this->secret(),
                'Accept' => 'application/json',
            ])->timeout(15);

            $response = match (strtoupper($method)) {
                'GET' => $http->get($url, $payload),
                'POST' => $http->post($url, $payload),
                'PUT' => $http->put($url, $payload),
                'PATCH' => $http->patch($url, $payload),
                'DELETE' => $http->delete($url, $payload),
                default => throw new \InvalidArgumentException("Unsupported HTTP method: {$method}"),
            };

            if ($response->successful()) {
                Log::info("PublishingPlatform success: {$method} {$path}");

                return $response->json() ?? [];
            }

            Log::error("PublishingPlatform error: {$response->status()} {$method} {$path}", [
                'body' => $response->body(),
            ]);

            throw new \RuntimeException(
                "Publishing Platform returned {$response->status()}: " . $response->body()
            );
        } catch (\RuntimeException $e) {
            throw $e;
        } catch (\Throwable $e) {
            Log::error("PublishingPlatform connection error: {$method} {$path}", [
                'error' => $e->getMessage(),
            ]);

            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    // ─── Existing: Subscription Provisioning ─────────────────────────

    /**
     * Provision a subscription on the Publishing Platform (Day News).
     */
    public function provisionSubscription(ServiceSubscription $subscription): array
    {
        $tierMapping = [
            'basic' => 'standard',
            'premium' => 'premium',
            'enterprise' => 'enterprise',
            'trial' => 'trial',
        ];

        $payload = [
            'email' => $subscription->customer->email ?? $subscription->user->email,
            'business_name' => $subscription->customer->business_name ?? 'My Business',
            'crm_order_id' => (string) $subscription->order_id,
            'plan_tier' => $tierMapping[$subscription->tier] ?? 'standard',
            'subscription_id' => (string) $subscription->id,
            'stripe_subscription_id' => $subscription->stripe_subscription_id,
            'started_at' => $subscription->subscription_started_at?->toIso8601String() ?? now()->toIso8601String(),
            'expires_at' => $subscription->subscription_expires_at?->toIso8601String() ?? now()->addMonth()->toIso8601String(),
        ];

        return $this->request('POST', '/api/v1/provision/subscription', $payload);
    }

    // ─── WS-2: Bridge Write Endpoints ────────────────────────────────

    /**
     * Push an AI-generated article to Day.News for publishing.
     *
     * @param  array{title: string, content: string, excerpt?: string, business_name: string, community_id: string|int, author_name?: string, category?: string, tags?: string[], featured_image_url?: string, metadata?: array<string, mixed>}  $data
     */
    public function publishArticle(array $data): array
    {
        return $this->request('POST', '/api/v1/bridge/articles', $data);
    }

    /**
     * Create or update a business listing on the publishing platforms (DTG, GEC, AlphaSite).
     *
     * @param  array{business_name: string, community_id: string|int, external_id?: string, category: string, description?: string, address?: string, city?: string, state?: string, zip?: string, phone?: string, email?: string, website?: string, hours?: array<string, mixed>, logo_url?: string, photos?: string[], platform?: string, metadata?: array<string, mixed>}  $data
     */
    public function createListing(array $data): array
    {
        return $this->request('POST', '/api/v1/bridge/listings', $data);
    }

    /**
     * Create an event listing on the publishing platform (GEC).
     *
     * @param  array{title: string, description: string, community_id: string|int, business_name: string, external_id?: string, event_date: string, end_date?: string, venue?: string, address?: string, category?: string, ticket_url?: string, featured_image_url?: string, metadata?: array<string, mixed>}  $data
     */
    public function createEvent(array $data): array
    {
        return $this->request('POST', '/api/v1/bridge/events', $data);
    }

    /**
     * Schedule a business feature in the next community newsletter.
     *
     * @param  array{business_name: string, community_id: string|int, external_id?: string, headline?: string, body?: string, cta_url?: string, cta_text?: string, logo_url?: string, priority?: string, metadata?: array<string, mixed>}  $data
     */
    public function featureInNewsletter(array $data): array
    {
        return $this->request('POST', '/api/v1/bridge/newsletter-features', $data);
    }

    /**
     * Activate an AlphaSite profile for a business.
     *
     * @param  array{business_name: string, community_id: string|int, external_id?: string, email: string, tier?: string, trial_days?: int, features?: string[], metadata?: array<string, mixed>}  $data
     */
    public function activateAlphaSite(array $data): array
    {
        return $this->request('POST', '/api/v1/bridge/alphasite', $data);
    }

    /**
     * Pull readership and impression data FROM the Publishing Platform.
     *
     * Returns aggregated per-business metrics: article views, listing views,
     * event page views, newsletter click-throughs, social impressions.
     *
     * @return array<string, mixed>
     */
    public function reportReadership(string|int $communityId, ?string $month = null): array
    {
        $params = [];
        if ($month !== null) {
            $params['month'] = $month;
        }

        return $this->request('GET', "/api/v1/bridge/readership/{$communityId}", $params);
    }
}
