<?php

namespace App\Services;

use Fibonacco\AiGatewayClient\AiGatewayClient;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class OpenRouterService
{
    protected AiGatewayClient $gateway;

    public function __construct(AiGatewayClient $gateway)
    {
        $this->gateway = $gateway;
    }

    /**
     * Send chat completion request
     * Relays to AI Gateway.
     */
    public function chatCompletion(array $messages, array $options = []): ?array
    {
        try {
            $lastMessage = end($messages);
            $prompt = $lastMessage['content'] ?? '';
            $system = $options['system'] ?? null;

            $result = $this->gateway->agent(
                prompt: $prompt,
                tools: [],
                context: ['system_prompt' => $system, 'messages' => $messages]
            );

            if (isset($result['error']) && $result['error']) {
                Log::error('Gateway error', ['error' => $result['error']]);
                return null;
            }

            return [
                'id' => 'chatcmpl-' . \Illuminate\Support\Str::random(12),
                'object' => 'chat.completion',
                'created' => time(),
                'model' => 'gateway-model',
                'choices' => [
                    [
                        'index' => 0,
                        'message' => [
                            'role' => 'assistant',
                            'content' => $result['response'] ?? '',
                        ],
                        'finish_reason' => 'stop',
                    ]
                ],
                'usage' => [
                    'prompt_tokens' => 0,
                    'completion_tokens' => 0,
                    'total_tokens' => 0,
                ]
            ];

        } catch (\Exception $e) {
            Log::error('OpenRouter Adapter error', ['error' => $e->getMessage()]);
            return null;
        }
    }

    /**
     * Get available models
     */
    public function getModels(): array
    {
        try {
            // Gateway doesn't expose raw models list yet in client, return basics
            return [
                ['id' => 'gateway-default', 'name' => 'Gateway Default Model']
            ];
        } catch (\Exception $e) {
            Log::error('OpenRouter get models error', ['error' => $e->getMessage()]);
            return [];
        }
    }
}
