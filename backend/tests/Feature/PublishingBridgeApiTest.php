<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PublishingBridgeApiTest extends TestCase
{
    use RefreshDatabase;

    private string $validKey = 'test-bridge-api-key-12345';

    /**
     * Bridge ping with a valid API key returns 200 and status ok.
     */
    public function test_bridge_ping_with_valid_key_returns_ok(): void
    {
        config()->set('services.publishing_bridge.api_key', $this->validKey);

        $response = $this->getJson('/api/v1/bridge/ping', [
            'Authorization' => 'Bearer '.$this->validKey,
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'status' => 'ok',
                'service' => 'command-center',
            ])
            ->assertJsonStructure(['status', 'service', 'timestamp']);
    }

    /**
     * Bridge ping with a wrong API key returns 401.
     */
    public function test_bridge_ping_with_wrong_key_returns_unauthorized(): void
    {
        config()->set('services.publishing_bridge.api_key', $this->validKey);

        $response = $this->getJson('/api/v1/bridge/ping', [
            'Authorization' => 'Bearer wrong-key-entirely',
        ]);

        $response->assertStatus(401)
            ->assertJson(['error' => 'Unauthorized']);
    }

    /**
     * Bridge ping with no Authorization header returns 401.
     */
    public function test_bridge_ping_with_no_key_returns_unauthorized(): void
    {
        config()->set('services.publishing_bridge.api_key', $this->validKey);

        $response = $this->getJson('/api/v1/bridge/ping');

        $response->assertStatus(401)
            ->assertJson(['error' => 'Unauthorized']);
    }

    /**
     * Bridge ping when PUBLISHING_BRIDGE_API_KEY is not configured returns 503.
     */
    public function test_bridge_ping_with_unconfigured_env_returns_service_unavailable(): void
    {
        config()->set('services.publishing_bridge.api_key', null);

        $response = $this->getJson('/api/v1/bridge/ping', [
            'Authorization' => 'Bearer some-key',
        ]);

        $response->assertStatus(503)
            ->assertJson(['error' => 'Bridge API not configured']);
    }
}
