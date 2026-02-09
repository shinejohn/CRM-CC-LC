<?php

declare(strict_types=1);

namespace Fibonacco\AiGatewayClient;

use Illuminate\Support\Facades\Http;
use Illuminate\Http\Client\RequestException;

class AiGatewayClient
{
    protected string $baseUrl;
    protected string $token;
    protected int $timeout;

    public function __construct()
    {
        $this->baseUrl = rtrim(config('ai-gateway-client.url') ?? env('AI_GATEWAY_URL'), '/');
        $this->token = config('ai-gateway-client.token') ?? env('AI_GATEWAY_TOKEN') ?? '';
        $this->timeout = (int) (config('ai-gateway-client.timeout') ?? 120);
    }

    /**
     * Simple query across all platforms
     */
    public function query(string $question): array
    {
        return $this->post('/api/ai/query', [
            'question' => $question,
        ]);
    }

    /**
     * Run agent with specific tools
     */
    public function agent(string $prompt, array $tools = [], array $context = []): array
    {
        return $this->post('/api/ai/agent', [
            'prompt' => $prompt,
            'tools' => $tools,
            'context' => $context,
        ]);
    }

    /**
     * Execute a workflow
     */
    public function workflow(array $workflow): array
    {
        return $this->post('/api/ai/workflow', $workflow);
    }

    /**
     * Search knowledge base
     */
    public function knowledge(string $query, ?string $platform = null): array
    {
        return $this->post('/api/ai/knowledge', [
            'query' => $query,
            'platform' => $platform,
        ]);
    }

    /**
     * Get available tools
     */
    public function tools(): array
    {
        return $this->get('/api/ai/tools');
    }

    /**
     * Get platform schemas
     */
    public function schemas(?string $platform = null): array
    {
        $endpoint = $platform
            ? "/api/ai/schemas/{$platform}"
            : '/api/ai/schemas';

        return $this->get($endpoint);
    }

    /**
     * Make POST request
     */
    protected function post(string $endpoint, array $data): array
    {
        $response = Http::withToken($this->token)
            ->timeout($this->timeout)
            ->post($this->baseUrl . $endpoint, $data);

        if (!$response->successful()) {
            // For now, if gateway is unavailable, let's return a mocked response structure 
            // so we don't break the local development flow completely.
            if ($response->status() === 0 || $response->status() >= 500) {
                return ['error' => 'Gateway unavailable', 'mock' => true];
            }
            throw new \RuntimeException(
                "AI Gateway error [{$response->status()}]: " . $response->body()
            );
        }

        return $response->json();
    }

    /**
     * Make GET request
     */
    protected function get(string $endpoint): array
    {
        $response = Http::withToken($this->token)
            ->timeout($this->timeout)
            ->get($this->baseUrl . $endpoint);

        if (!$response->successful()) {
            if ($response->status() === 0 || $response->status() >= 500) {
                return ['error' => 'Gateway unavailable', 'mock' => true];
            }
            throw new \RuntimeException(
                "AI Gateway error [{$response->status()}]: " . $response->body()
            );
        }

        return $response->json();
    }
}
