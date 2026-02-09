<?php

declare(strict_types=1);

namespace Fibonacco\AiToolsCore\Contracts;

interface AiTool
{
    /**
     * Unique tool identifier (e.g., 'database_query')
     */
    public function name(): string;

    /**
     * Human-readable description for AI
     */
    public function description(): string;

    /**
     * Parameter definitions
     */
    public function parameters(): array;

    /**
     * Execute the tool
     */
    public function execute(array $parameters): mixed;

    /**
     * Convert to Anthropic Tool Definition (Replacing Prism)
     */
    public function toAnthropicTool(): array;

    /**
     * Tool category for organization
     */
    public function category(): string;

    /**
     * Whether tool requires authenticated user
     */
    public function requiresAuth(): bool;

    /**
     * Required permission (null = no permission needed)
     */
    public function permission(): ?string;
}
