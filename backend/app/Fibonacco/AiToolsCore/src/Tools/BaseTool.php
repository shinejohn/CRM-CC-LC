<?php

declare(strict_types=1);

namespace Fibonacco\AiToolsCore\Tools;

use Fibonacco\AiToolsCore\Contracts\AiTool;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use Throwable;

abstract class BaseTool implements AiTool
{
    protected string $toolCategory = 'general';
    protected bool $authRequired = false;
    protected ?string $requiredPermission = null;
    protected bool $logExecutions = true;

    /**
     * Convert to Anthropic Tool Definition
     */
    public function toAnthropicTool(): array
    {
        $properties = [];
        $required = [];

        foreach ($this->parameters() as $name => $config) {
            $desc = $config['description'] ?? '';
            $props = ['type' => $config['type']];

            if ($desc) {
                $props['description'] = $desc;
            }

            if ($config['type'] === 'enum' && !empty($config['enum'])) {
                $props['type'] = 'string';
                $props['enum'] = $config['enum'];
            } elseif ($config['type'] === 'array') {
                // Approximate array to array type
                $props['type'] = 'array';
                // Could expand with items schema if needed
            }

            $properties[$name] = $props;

            if ($config['required'] ?? false) {
                $required[] = $name;
            }
        }

        return [
            'name' => $this->name(),
            'description' => $this->description(),
            'input_schema' => [
                'type' => 'object',
                'properties' => $properties,
                'required' => $required,
            ],
        ];
    }

    /**
     * Safe execution with logging, validation, error handling
     */
    protected function safeExecute(array $params): string
    {
        $start = microtime(true);
        $toolName = $this->name();

        try {
            // Validate parameters
            $this->validateParameters($params);

            // Check authentication
            if ($this->authRequired && !auth()->check()) {
                throw new \RuntimeException("Tool '{$toolName}' requires authentication");
            }

            // Check permission
            if ($this->requiredPermission && !auth()->user()?->can($this->requiredPermission)) {
                throw new \RuntimeException("Permission denied for tool '{$toolName}'");
            }

            // Execute
            $result = $this->execute($params);

            // Log success
            if ($this->logExecutions) {
                Log::info("AI Tool: {$toolName}", [
                    'tool' => $toolName,
                    'category' => $this->category(),
                    'duration_ms' => round((microtime(true) - $start) * 1000, 2),
                    'platform' => config('ai-tools-core.platform', 'unknown'),
                    'user_id' => auth()->id(),
                ]);
            }

            return $this->formatResult($result);

        } catch (ValidationException $e) {
            Log::warning("AI Tool validation failed: {$toolName}", [
                'errors' => $e->errors(),
            ]);
            return json_encode([
                'error' => true,
                'type' => 'validation',
                'message' => implode(', ', array_map(fn($errs) => implode(', ', $errs), $e->errors())),
            ]);

        } catch (Throwable $e) {
            Log::error("AI Tool error: {$toolName}", [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return json_encode([
                'error' => true,
                'type' => 'execution',
                'message' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Validate parameters against schema
     */
    protected function validateParameters(array $params): void
    {
        $rules = [];

        foreach ($this->parameters() as $name => $config) {
            $ruleSet = [];

            if ($config['required'] ?? false) {
                $ruleSet[] = 'required';
            } else {
                $ruleSet[] = 'nullable';
            }

            $ruleSet[] = match ($config['type']) {
                'string' => 'string',
                'integer' => 'integer',
                'number' => 'numeric',
                'boolean' => 'boolean',
                'array' => 'array',
                'enum' => 'in:' . implode(',', $config['enum'] ?? []),
                default => 'string',
            };

            $rules[$name] = implode('|', $ruleSet);
        }

        $validator = Validator::make($params, $rules);

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }
    }

    /**
     * Format result for LLM consumption
     */
    protected function formatResult(mixed $result): string
    {
        if (is_string($result)) {
            return $result;
        }
        return json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    }

    // Public wrapper for execution logic if needed externally
    public function executeSafe(array $params): string
    {
        return $this->safeExecute($params);
    }

    public function category(): string
    {
        return $this->toolCategory;
    }

    public function requiresAuth(): bool
    {
        return $this->authRequired;
    }

    public function permission(): ?string
    {
        return $this->requiredPermission;
    }
}
