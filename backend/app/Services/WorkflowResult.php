<?php

namespace App\Services;

class WorkflowResult
{
    public function __construct(
        public readonly bool $success,
        public readonly string $workflowId,
        public readonly array $steps = [],
        public readonly ?string $error = null
    ) {
    }

    public function toArray(): array
    {
        return [
            'success' => $this->success,
            'workflow_id' => $this->workflowId,
            'steps' => $this->steps,
            'error' => $this->error,
        ];
    }
}
