<?php

declare(strict_types=1);

namespace Fibonacco\AiToolsCore\Tools;

use Fibonacco\AiToolsCore\Contracts\AiTool;

class ToolRegistry
{
    /** @var array<string, AiTool> */
    protected array $tools = [];

    /** @var array<string, array<string>> */
    protected array $categories = [];

    /**
     * Register a tool
     */
    public function register(AiTool $tool): self
    {
        $name = $tool->name();
        $category = $tool->category();

        $this->tools[$name] = $tool;

        if (!isset($this->categories[$category])) {
            $this->categories[$category] = [];
        }
        $this->categories[$category][] = $name;

        return $this;
    }

    /**
     * Register multiple tools
     */
    public function registerMany(array $tools): self
    {
        foreach ($tools as $tool) {
            $this->register($tool);
        }
        return $this;
    }

    /**
     * Get tool by name
     */
    public function get(string $name): ?AiTool
    {
        return $this->tools[$name] ?? null;
    }

    /**
     * Check if tool exists
     */
    public function has(string $name): bool
    {
        return isset($this->tools[$name]);
    }

    /**
     * Get all tools
     */
    public function all(): array
    {
        return $this->tools;
    }

    /**
     * Get tool names
     */
    public function names(): array
    {
        return array_keys($this->tools);
    }

    /**
     * Get tools by category
     */
    public function byCategory(string $category): array
    {
        $names = $this->categories[$category] ?? [];
        return array_intersect_key($this->tools, array_flip($names));
    }

    /**
     * Get categories
     */
    public function categories(): array
    {
        return array_keys($this->categories);
    }

    /**
     * Get Anthropic Tool definitions
     */
    public function getAnthropicTools(?array $names = null): array
    {
        $tools = $names === null
            ? $this->tools
            : array_intersect_key($this->tools, array_flip($names));

        return array_map(
            fn(AiTool $tool) => $tool->toAnthropicTool(),
            array_values($tools)
        );
    }

    /**
     * Get tool descriptions for system prompt
     */
    public function getDescriptions(?array $names = null): string
    {
        $tools = $names === null
            ? $this->tools
            : array_intersect_key($this->tools, array_flip($names));

        $lines = [];
        foreach ($tools as $tool) {
            $params = implode(', ', array_keys($tool->parameters()));
            $lines[] = "• {$tool->name()}({$params}): {$tool->description()}";
        }

        return implode("\n", $lines);
    }

    /**
     * Execute tool by name
     */
    public function execute(string $name, array $parameters): mixed
    {
        /** @var \Fibonacco\AiToolsCore\Tools\BaseTool $tool */
        $tool = $this->get($name);

        if (!$tool) {
            throw new \InvalidArgumentException("Unknown tool: {$name}");
        }

        return $tool->executeSafe($parameters);
    }
}
