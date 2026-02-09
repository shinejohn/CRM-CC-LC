<?php

declare(strict_types=1);

namespace Fibonacco\AiToolsCore\Agent;

class AgentResult
{
    public function __construct(
        public readonly bool $success,
        public readonly string $response,
        public readonly array $toolCalls = [],
        public readonly ?string $error = null
    ) {
    }

    public function toArray(): array
    {
        return [
            'success' => $this->success,
            'response' => $this->response,
            'tool_calls' => $this->toolCalls,
            'error' => $this->error,
        ];
    }

    public function failed(): bool
    {
        return !$this->success;
    }
}
