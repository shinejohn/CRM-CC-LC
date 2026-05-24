<?php

declare(strict_types=1);

namespace App\Services\AI;

use Anthropic\Client;
use Anthropic\Messages\RawContentBlockDeltaEvent;
use Anthropic\Messages\RawContentBlockStartEvent;
use Anthropic\Messages\InputJSONDelta;
use Anthropic\Messages\TextDelta;
use Anthropic\Messages\ToolUseBlock;
use Exception;
use Generator;
use Illuminate\Support\Facades\Log;

final class PrismAiService
{
    private Client $client;

    public function __construct()
    {
        $this->client = new Client(
            apiKey: config('services.anthropic.api_key'),
        );
    }

    /**
     * Freeform chat — returns the assistant's text response.
     *
     * @param array<array{role: string, content: string}> $messages Full conversation history
     */
    public function chat(
        array $messages,
        ?string $systemPrompt = null,
        ?string $model = null
    ): string {
        try {
            $model ??= config('command-center-ai.ai_models.chat');

            $params = [
                'model'      => $model,
                'max_tokens' => 2000,
                'messages'   => $this->normalizeMessages($messages),
            ];

            if ($systemPrompt) {
                $params['system'] = $systemPrompt;
            }

            $response = $this->client->messages->create($params);

            return $this->extractText($response->content);
        } catch (Exception $e) {
            Log::error('PrismAiService::chat error', ['error' => $e->getMessage()]);
            throw $e;
        }
    }

    /**
     * Structured JSON generation — returns parsed array matching $schema.
     *
     * @param array<string,mixed> $schema JSON Schema for the expected output
     * @return array<string,mixed>
     */
    public function generateStructured(
        string $prompt,
        array $schema,
        ?string $systemPrompt = null
    ): array {
        $schemaDescription = json_encode($schema, JSON_PRETTY_PRINT);

        $systemInstructions = ($systemPrompt ?? '') . "\n\n" .
            "You MUST respond with valid JSON only, matching this schema exactly:\n" .
            $schemaDescription . "\n" .
            "Do not include any text outside the JSON object.";

        try {
            $model = config('command-center-ai.ai_models.actions');

            $response = $this->client->messages->create([
                'model'      => $model,
                'max_tokens' => 2000,
                'system'     => trim($systemInstructions),
                'messages'   => [['role' => 'user', 'content' => $prompt]],
            ]);

            $text = $this->extractText($response->content);

            // Strip markdown code fences if present
            $text = preg_replace('/^```(?:json)?\s*/m', '', $text);
            $text = preg_replace('/\s*```$/m', '', $text);

            $parsed = json_decode(trim($text), true);

            if (json_last_error() !== JSON_ERROR_NONE) {
                throw new Exception('AI returned invalid JSON: ' . json_last_error_msg());
            }

            return $parsed;
        } catch (Exception $e) {
            Log::error('PrismAiService::generateStructured error', ['error' => $e->getMessage()]);
            throw $e;
        }
    }

    /**
     * Streaming chat — yields OpenAI-compatible SSE data arrays.
     *
     * Each yielded item is an array ready for `json_encode` + SSE output.
     * Text chunks: ['choices' => [['delta' => ['content' => '...']]]]
     * Tool calls:  ['choices' => [['delta' => ['tool_calls' => [...]]]]]
     *
     * @param array<array{role: string, content: string}> $messages
     */
    public function streamChat(
        array $messages,
        ?string $systemPrompt = null,
        ?string $model = null
    ): Generator {
        $model ??= config('command-center-ai.ai_models.chat');

        $params = [
            'model'      => $model,
            'max_tokens' => 2000,
            'messages'   => $this->normalizeMessages($messages),
        ];

        if ($systemPrompt) {
            $params['system'] = $systemPrompt;
        }

        try {
            $stream = $this->client->messages->createStream($params);

            // Track in-progress tool use blocks by index
            $pendingToolCalls = [];

            foreach ($stream as $event) {
                if ($event instanceof RawContentBlockStartEvent) {
                    $block = $event->content_block;
                    if ($block instanceof ToolUseBlock) {
                        $pendingToolCalls[$event->index] = [
                            'id'        => $block->id,
                            'name'      => $block->name,
                            'arguments' => '',
                        ];
                    }
                } elseif ($event instanceof RawContentBlockDeltaEvent) {
                    $delta = $event->delta;

                    if ($delta instanceof TextDelta) {
                        yield ['choices' => [['delta' => ['content' => $delta->text]]]];
                    } elseif ($delta instanceof InputJSONDelta) {
                        $idx = $event->index;
                        if (isset($pendingToolCalls[$idx])) {
                            $pendingToolCalls[$idx]['arguments'] .= $delta->partial_json;
                        }
                    }
                }
            }

            // Emit completed tool calls after stream ends
            foreach ($pendingToolCalls as $toolCall) {
                $arguments = json_decode($toolCall['arguments'], true) ?? [];
                yield [
                    'choices' => [[
                        'delta' => [
                            'tool_calls' => [[
                                'id'       => $toolCall['id'],
                                'name'     => $toolCall['name'],
                                'function' => [
                                    'name'      => $toolCall['name'],
                                    'arguments' => $toolCall['arguments'],
                                ],
                                'arguments' => $arguments,
                                'status'   => 'pending',
                            ]],
                        ],
                    ]],
                ];
            }
        } catch (Exception $e) {
            Log::error('PrismAiService::streamChat error', ['error' => $e->getMessage()]);
            yield ['error' => $e->getMessage()];
        }
    }

    /**
     * Ensure messages are in the correct format (role: user|assistant only).
     *
     * @param array<array{role: string, content: string}> $messages
     * @return array<array{role: string, content: string}>
     */
    private function normalizeMessages(array $messages): array
    {
        return array_values(array_map(function (array $msg): array {
            return [
                'role'    => in_array($msg['role'], ['user', 'assistant'], true) ? $msg['role'] : 'user',
                'content' => $msg['content'] ?? '',
            ];
        }, array_filter($messages, fn (array $m): bool => !empty($m['content']))));
    }

    /**
     * Extract text from content blocks array.
     *
     * @param array<mixed> $contentBlocks
     */
    private function extractText(array $contentBlocks): string
    {
        $text = '';
        foreach ($contentBlocks as $block) {
            if (isset($block->type) && $block->type === 'text' && isset($block->text)) {
                $text .= $block->text;
            }
        }
        return $text;
    }
}
