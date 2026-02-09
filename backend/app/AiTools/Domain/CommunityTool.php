<?php

declare(strict_types=1);

namespace App\AiTools\Domain;

use App\Models\Community;
use Fibonacco\AiToolsCore\Tools\BaseTool;

class CommunityTool extends BaseTool
{
    protected string $toolCategory = 'domain';

    public function name(): string
    {
        return 'community';
    }

    public function description(): string
    {
        return 'Manage communities. Actions: list, get, stats, by_state, healthy, at_risk.';
    }

    public function parameters(): array
    {
        return [
            'action' => [
                'type' => 'enum',
                'enum' => ['list', 'get', 'stats', 'by_state', 'healthy', 'at_risk'],
                'required' => true,
            ],
            'id' => ['type' => 'string', 'required' => false],
            'state' => ['type' => 'string', 'required' => false],
            'limit' => ['type' => 'integer', 'required' => false],
        ];
    }

    public function execute(array $params): array
    {
        return match ($params['action']) {
            'list' => $this->listCommunities((int) ($params['limit'] ?? 20)),
            'get' => $this->getCommunity($params['id'] ?? ''),
            'stats' => $this->getStats($params['id'] ?? ''),
            'by_state' => $this->byState($params['state'] ?? '', (int) ($params['limit'] ?? 20)),
            'healthy' => $this->getHealthy((int) ($params['limit'] ?? 20)),
            'at_risk' => $this->getAtRisk((int) ($params['limit'] ?? 20)),
            default => ['error' => true, 'message' => 'Unknown action'],
        };
    }

    protected function listCommunities(int $limit): array
    {
        // Removed 'latestMetrics' eager load until relation exists
        $communities = Community::limit($limit)
            ->get(['id', 'name', 'state']);

        return ['count' => $communities->count(), 'communities' => $communities->toArray()];
    }

    protected function getCommunity(string $id): array
    {
        // Removed 'latestMetrics' eager load until relation exists
        $community = Community::find($id);

        if (!$community) {
            return ['error' => true, 'message' => 'Community not found'];
        }

        return ['community' => $community->toArray()];
    }

    protected function getStats(string $id): array
    {
        // Removed 'latestMetrics' eager load until relation exists
        $community = Community::find($id);

        if (!$community) {
            return ['error' => true, 'message' => 'Community not found'];
        }

        // Mock metrics if relation missing
        //$metrics = $community->latestMetrics;
        $metrics = null;

        return [
            'community' => $community->name,
            'stats' => [
                'monthly_revenue' => $metrics?->monthly_revenue ?? 0,
                'active_businesses' => $metrics?->active_businesses ?? 0,
                'articles_this_month' => $metrics?->articles_count ?? 0,
                'engagement_rate' => $metrics?->engagement_rate ?? 0,
                'health_score' => $metrics?->health_score ?? 0,
            ],
        ];
    }

    protected function byState(string $state, int $limit): array
    {
        $communities = Community::where('state', $state)
            ->limit($limit)
            ->get(['id', 'name', 'state']);

        return ['state' => $state, 'count' => $communities->count(), 'communities' => $communities->toArray()];
    }

    protected function getHealthy(int $limit): array
    {
        // Fallback or skip relation query
        /*
        $communities = Community::whereHas('latestMetrics', function ($q) {
            $q->where('health_score', '>=', 80);
        })->limit($limit)->get(['id', 'name', 'state']);
        */
        $communities = Community::limit($limit)->get(['id', 'name', 'state']); // Placeholder

        return [
            'description' => 'Communities with health score >= 80 (Placeholder - Metrics not linked)',
            'count' => $communities->count(),
            'communities' => $communities->toArray(),
        ];
    }

    protected function getAtRisk(int $limit): array
    {
        /*
        $communities = Community::whereHas('latestMetrics', function ($q) {
            $q->where('health_score', '<', 50);
        })->limit($limit)->get(['id', 'name', 'state']);
        */
        $communities = Community::limit($limit)->get(['id', 'name', 'state']); // Placeholder

        return [
            'description' => 'Communities with health score < 50 (Placeholder - Metrics not linked)',
            'count' => $communities->count(),
            'communities' => $communities->toArray(),
        ];
    }
}
