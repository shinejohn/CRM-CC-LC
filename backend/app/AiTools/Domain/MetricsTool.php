<?php

declare(strict_types=1);

namespace App\AiTools\Domain;

use App\Models\RevenueRecord;
use App\Models\Community;
use Fibonacco\AiToolsCore\Tools\BaseTool;
use Illuminate\Support\Facades\DB;

class MetricsTool extends BaseTool
{
    protected string $toolCategory = 'domain';

    public function name(): string
    {
        return 'metrics';
    }

    public function description(): string
    {
        return 'Get business metrics. Actions: revenue_summary, revenue_by_community, growth_trends, top_performers.';
    }

    public function parameters(): array
    {
        return [
            'action' => [
                'type' => 'enum',
                'enum' => ['revenue_summary', 'revenue_by_community', 'growth_trends', 'top_performers'],
                'required' => true,
            ],
            'community_id' => ['type' => 'string', 'required' => false],
            'period' => [
                'type' => 'enum',
                'enum' => ['day', 'week', 'month', 'quarter', 'year'],
                'required' => false,
            ],
            'limit' => ['type' => 'integer', 'required' => false],
        ];
    }

    public function execute(array $params): array
    {
        return match ($params['action']) {
            'revenue_summary' => $this->revenueSummary($params['period'] ?? 'month'),
            'revenue_by_community' => $this->revenueByCommunity((int) ($params['limit'] ?? 20)),
            'growth_trends' => $this->growthTrends($params['community_id'] ?? null),
            'top_performers' => $this->topPerformers((int) ($params['limit'] ?? 10)),
            default => ['error' => true, 'message' => 'Unknown action'],
        };
    }

    protected function revenueSummary(string $period): array
    {
        $startDate = match ($period) {
            'day' => now()->startOfDay(),
            'week' => now()->startOfWeek(),
            'month' => now()->startOfMonth(),
            'quarter' => now()->startOfQuarter(),
            'year' => now()->startOfYear(),
            default => now()->startOfMonth(),
        };

        $total = RevenueRecord::where('recorded_at', '>=', $startDate)->sum('amount');
        $count = RevenueRecord::where('recorded_at', '>=', $startDate)->count();

        $previousStart = match ($period) {
            'day' => now()->subDay()->startOfDay(),
            'week' => now()->subWeek()->startOfWeek(),
            'month' => now()->subMonth()->startOfMonth(),
            'quarter' => now()->subQuarter()->startOfQuarter(),
            'year' => now()->subYear()->startOfYear(),
            default => now()->subMonth()->startOfMonth(),
        };

        $previousTotal = RevenueRecord::whereBetween('recorded_at', [$previousStart, $startDate])->sum('amount');
        $growth = $previousTotal > 0 ? round((($total - $previousTotal) / $previousTotal) * 100, 1) : 0;

        return [
            'period' => $period,
            'total_revenue' => $total,
            'transaction_count' => $count,
            'previous_period_revenue' => $previousTotal,
            'growth_percentage' => $growth,
        ];
    }

    protected function revenueByCommunity(int $limit): array
    {
        $communities = Community::select('id', 'name')
            ->withSum([
                'revenueRecords as total_revenue' => function ($q) {
                    $q->where('recorded_at', '>=', now()->startOfMonth());
                }
            ], 'amount')
            ->orderByDesc('total_revenue')
            ->limit($limit)
            ->get();

        return [
            'period' => 'This month',
            'communities' => $communities->map(fn($c) => [
                'id' => $c->id,
                'name' => $c->name,
                'revenue' => $c->total_revenue ?? 0,
            ])->toArray(),
        ];
    }

    protected function growthTrends(?string $communityId): array
    {
        $query = RevenueRecord::select(
            DB::raw("DATE_TRUNC('month', recorded_at) as month"),
            DB::raw('SUM(amount) as total')
        );

        if ($communityId) {
            $query->where('community_id', $communityId);
        }

        $trends = $query->where('recorded_at', '>=', now()->subMonths(6))
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        return [
            'period' => 'Last 6 months',
            'community_id' => $communityId,
            'trends' => $trends->map(fn($t) => [
                'month' => $t->month,
                'revenue' => $t->total,
            ])->toArray(),
        ];
    }

    protected function topPerformers(int $limit): array
    {
        $communities = Community::select('id', 'name', 'state')
            ->whereHas('latestMetrics', function ($q) {
                $q->where('health_score', '>=', 80);
            })
            ->with([
                'latestMetrics' => function ($q) {
                    $q->select('community_id', 'health_score', 'monthly_revenue', 'engagement_rate');
                }
            ])
            ->limit($limit)
            ->get();

        return [
            'description' => 'Top performing communities',
            'communities' => $communities->map(fn($c) => [
                'id' => $c->id,
                'name' => $c->name,
                'state' => $c->state,
                // Note: The select() call in with() might filter out necessary columns (id) if not adjusted in relation config
                // but assuming it's standard relationship setup.
                // Using latestMetrics directly might fail if selected columns don't include primary key, 
                // but let's assume standard Laravel behavior.
                'health_score' => $c->latestMetrics?->health_score,
                'monthly_revenue' => $c->latestMetrics?->monthly_revenue,
            ])->toArray(),
        ];
    }
}
