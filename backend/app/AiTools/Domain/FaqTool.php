<?php

declare(strict_types=1);

namespace App\AiTools\Domain;

use App\Models\Knowledge;
use Fibonacco\AiToolsCore\Tools\BaseTool;

class FaqTool extends BaseTool
{
    protected string $toolCategory = 'domain';
    protected bool $authRequired = true;

    public function name(): string
    {
        return 'create_faq';
    }

    public function description(): string
    {
        return 'Suggest a new FAQ based on recurring questions or new information.';
    }

    public function parameters(): array
    {
        return [
            'tenant_id' => [
                'type' => 'string',
                'description' => 'The tenant UUID',
                'required' => true,
            ],
            'question' => [
                'type' => 'string',
                'description' => 'The question being asked',
                'required' => true,
            ],
            'answer' => [
                'type' => 'string',
                'description' => 'The answer',
                'required' => true,
            ],
            'category' => [
                'type' => 'string',
                'description' => 'The category (e.g., pricing, features)',
                'required' => false,
            ],
        ];
    }

    public function execute(array $params): array
    {
        $existing = Knowledge::where('tenant_id', $params['tenant_id'])
            ->where('title', $params['question'])
            ->exists();

        if ($existing) {
            return ['error' => true, 'message' => 'This FAQ already exists.'];
        }

        $knowledge = Knowledge::create([
            'tenant_id' => $params['tenant_id'],
            'title' => $params['question'],
            'content' => $params['answer'],
            'category' => $params['category'] ?? 'faq',
            'is_public' => false,
            'validation_status' => 'suggested',
        ]);

        return [
            'success' => true,
            'message' => 'FAQ suggestion created for review.',
            'id' => $knowledge->id,
        ];
    }
}
