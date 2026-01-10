<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class OpenRouterService
{
    protected string $apiKey;
    protected string $baseUrl = 'https://openrouter.ai/api/v1';

    public function __construct()
    {
        $this->apiKey = config('services.openrouter.api_key');
    }

    /**
     * Send chat completion request
     */
    public function chatCompletion(array $messages, array $options = []): ?array
    {
        try {
            $payload = [
                'model' => $options['model'] ?? 'anthropic/claude-3.5-sonnet',
                'messages' => $messages,
                'temperature' => $options['temperature'] ?? 0.7,
                'max_tokens' => $options['max_tokens'] ?? 2000,
            ];

            if (isset($options['system'])) {
                array_unshift($payload['messages'], [
                    'role' => 'system',
                    'content' => $options['system'],
                ]);
            }

            $response = Http::withHeaders([
                'Authorization' => "Bearer {$this->apiKey}",
                'Content-Type' => 'application/json',
                'HTTP-Referer' => config('app.url', 'https://fibonacco.com'),
                'X-Title' => 'Fibonacco Learning Center',
            ])->post("{$this->baseUrl}/chat/completions", $payload);

            if ($response->successful()) {
                return $response->json();
            }

            Log::error('OpenRouter API failed', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            return null;
        } catch (\Exception $e) {
            Log::error('OpenRouter API error', ['error' => $e->getMessage()]);
            return null;
        }
    }

    /**
     * Get available models
     */
    public function getModels(): array
    {
        try {
            $response = Http::withHeaders([
                'Authorization' => "Bearer {$this->apiKey}",
            ])->get("{$this->baseUrl}/models");

            if ($response->successful()) {
                return $response->json('data', []);
            }

            return [];
        } catch (\Exception $e) {
            Log::error('OpenRouter get models error', ['error' => $e->getMessage()]);
            return [];
        }
    }
}
