<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Ops;

use App\Http\Controllers\Controller;
use App\Models\Operations\ActionDefinition;
use App\Models\Operations\ActionExecution;
use App\Models\Operations\AIContextMemory;
use App\Models\Operations\AIRecommendation;
use App\Models\Operations\AISession;
use App\Models\Operations\Alert;
use App\Models\Operations\AlertRule;
use App\Models\Operations\CostTracking;
use App\Models\Operations\DevelopmentMilestone;
use App\Models\Operations\EmailIPReputation;
use App\Models\Operations\FeatureFlag;
use App\Models\Operations\HealthCheck;
use App\Models\Operations\Incident;
use App\Models\Operations\InfrastructureComponent;
use App\Models\Operations\MetricAggregate;
use App\Models\Operations\MetricDefinition;
use App\Models\Operations\MetricSnapshot;
use App\Models\Operations\PipelineMetric;
use App\Models\Operations\QueueMetric;
use App\Models\Operations\RevenueSnapshot;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

/**
 * Read-only + light state-transition endpoints for the Ops (POD) dashboard.
 *
 * Every list endpoint returns the `{ data, meta }` envelope the frontend
 * (src/services/operations/operations-api.ts) expects, with all attribute
 * keys mapped from snake_case to camelCase.
 */
final class OpsResourceController extends Controller
{
    /**
     * Convert a model's attribute array to camelCase keys, coercing numeric
     * strings (Laravel decimal casts) to floats so the TS `number` types line up.
     *
     * @param  array<string, mixed>  $row
     * @return array<string, mixed>
     */
    private function camelKeys(array $row): array
    {
        $out = [];

        foreach ($row as $key => $value) {
            // Laravel decimal casts return numeric strings ("12.34"); the frontend
            // types them as `number`, so coerce. UUIDs/dates are not is_numeric.
            if (is_string($value) && is_numeric($value)) {
                $value = $value + 0;
            }

            $out[Str::camel($key)] = $value;
        }

        return $out;
    }

    /**
     * Build the paginated `{ data, meta }` response the frontend expects.
     */
    private function paginated(LengthAwarePaginator $page): JsonResponse
    {
        return response()->json([
            'data' => collect($page->items())
                ->map(fn (Model $m): array => $this->camelKeys($m->attributesToArray()))
                ->values(),
            'meta' => [
                'current_page' => $page->currentPage(),
                'last_page' => $page->lastPage(),
                'per_page' => $page->perPage(),
                'total' => $page->total(),
            ],
        ]);
    }

    private function perPage(Request $request): int
    {
        $perPage = (int) $request->query('per_page', '25');

        return max(1, min($perPage, 200));
    }

    /**
     * Apply an equality filter for each provided (query param => column) pair.
     *
     * @param  array<string, string>  $map
     */
    private function applyEquals(Builder $query, Request $request, array $map): Builder
    {
        foreach ($map as $param => $column) {
            $value = $request->query($param);

            if ($value !== null && $value !== '') {
                $query->where($column, $value);
            }
        }

        return $query;
    }

    private function applyDateRange(Builder $query, Request $request, string $column): Builder
    {
        if ($request->filled('start_date')) {
            $query->where($column, '>=', $request->query('start_date'));
        }

        if ($request->filled('end_date')) {
            $query->where($column, '<=', $request->query('end_date'));
        }

        return $query;
    }

    // ---- Metrics -------------------------------------------------------

    public function metricDefinition(string $id): JsonResponse
    {
        $model = MetricDefinition::findOrFail($id);

        return response()->json(['data' => $this->camelKeys($model->attributesToArray())]);
    }

    public function metricSnapshots(Request $request): JsonResponse
    {
        $query = MetricSnapshot::query()->orderByDesc('recorded_at');

        $this->applyEquals($query, $request, [
            'metric_id' => 'metric_id',
            'dimension_key' => 'dimension_key',
            'dimension_value' => 'dimension_value',
            'granularity' => 'granularity',
        ]);
        $this->applyDateRange($query, $request, 'recorded_at');

        return $this->paginated($query->paginate($this->perPage($request)));
    }

    public function metricAggregates(Request $request): JsonResponse
    {
        $query = MetricAggregate::query()->orderByDesc('period_start');

        $this->applyEquals($query, $request, [
            'metric_id' => 'metric_id',
            'period_type' => 'period_type',
            'dimension_key' => 'dimension_key',
            'dimension_value' => 'dimension_value',
        ]);
        $this->applyDateRange($query, $request, 'period_start');

        return $this->paginated($query->paginate($this->perPage($request)));
    }

    // ---- AI ------------------------------------------------------------

    public function aiSessions(Request $request): JsonResponse
    {
        $query = AISession::query()->orderByDesc('started_at');

        $this->applyEquals($query, $request, [
            'session_type' => 'session_type',
            'status' => 'status',
            'created_by' => 'created_by',
        ]);

        return $this->paginated($query->paginate($this->perPage($request)));
    }

    public function aiSession(string $id): JsonResponse
    {
        $model = AISession::findOrFail($id);

        return response()->json(['data' => $this->camelKeys($model->attributesToArray())]);
    }

    public function storeAiSession(Request $request): JsonResponse
    {
        $data = $request->validate([
            'session_type' => ['sometimes', 'string', 'max:50'],
            'sessionType' => ['sometimes', 'string', 'max:50'],
            'trigger_source' => ['sometimes', 'string', 'max:255'],
            'triggerSource' => ['sometimes', 'string', 'max:255'],
            'user_query' => ['sometimes', 'nullable', 'string'],
            'userQuery' => ['sometimes', 'nullable', 'string'],
        ]);

        $session = AISession::create([
            'session_type' => $data['session_type'] ?? $data['sessionType'] ?? 'user_query',
            'trigger_source' => $data['trigger_source'] ?? $data['triggerSource'] ?? 'ops_dashboard',
            'user_query' => $data['user_query'] ?? $data['userQuery'] ?? null,
            'status' => 'completed',
            'started_at' => now(),
            'completed_at' => now(),
            'created_by' => $request->user()?->getAuthIdentifier() !== null
                ? (string) $request->user()->getAuthIdentifier()
                : 'system',
        ]);

        return response()->json(['data' => $this->camelKeys($session->attributesToArray())], 201);
    }

    public function aiRecommendations(Request $request): JsonResponse
    {
        $query = AIRecommendation::query()->orderByDesc('created_at');

        $this->applyEquals($query, $request, [
            'status' => 'status',
            'priority' => 'priority',
            'category' => 'category',
            'session_id' => 'session_id',
        ]);

        return $this->paginated($query->paginate($this->perPage($request)));
    }

    public function aiRecommendation(string $id): JsonResponse
    {
        $model = AIRecommendation::findOrFail($id);

        return response()->json(['data' => $this->camelKeys($model->attributesToArray())]);
    }

    public function approveRecommendation(Request $request, string $id): JsonResponse
    {
        $rec = AIRecommendation::findOrFail($id);
        $rec->update([
            'status' => 'approved',
            'reviewed_at' => now(),
            'reviewed_by' => $this->actor($request),
            'review_notes' => $request->input('notes'),
        ]);

        return response()->json(['data' => $this->camelKeys($rec->fresh()->attributesToArray())]);
    }

    public function rejectRecommendation(Request $request, string $id): JsonResponse
    {
        $rec = AIRecommendation::findOrFail($id);
        $rec->update([
            'status' => 'rejected',
            'reviewed_at' => now(),
            'reviewed_by' => $this->actor($request),
            'review_notes' => $request->input('notes'),
        ]);

        return response()->json(['data' => $this->camelKeys($rec->fresh()->attributesToArray())]);
    }

    public function aiContextMemory(Request $request): JsonResponse
    {
        $query = AIContextMemory::query()->orderByDesc('importance_score');

        $this->applyEquals($query, $request, [
            'memory_type' => 'memory_type',
            'category' => 'category',
            'key' => 'key',
        ]);

        if ($request->filled('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        return $this->paginated($query->paginate($this->perPage($request)));
    }

    // ---- Infrastructure ------------------------------------------------

    public function infrastructureComponents(Request $request): JsonResponse
    {
        $query = InfrastructureComponent::query()->orderBy('name');

        $this->applyEquals($query, $request, [
            'component_type' => 'component_type',
            'category' => 'category',
            'environment' => 'environment',
            'status' => 'current_status',
        ]);

        return $this->paginated($query->paginate($this->perPage($request)));
    }

    public function infrastructureComponent(string $id): JsonResponse
    {
        $model = InfrastructureComponent::findOrFail($id);

        return response()->json(['data' => $this->camelKeys($model->attributesToArray())]);
    }

    public function healthChecks(Request $request): JsonResponse
    {
        $query = HealthCheck::query()->orderByDesc('checked_at');

        $this->applyEquals($query, $request, [
            'component_id' => 'component_id',
            'status' => 'status',
        ]);
        $this->applyDateRange($query, $request, 'checked_at');

        return $this->paginated($query->paginate($this->perPage($request)));
    }

    public function emailIpReputation(Request $request): JsonResponse
    {
        $query = EmailIPReputation::query()->orderByDesc('reputation_score');

        $this->applyEquals($query, $request, [
            'ip_pool' => 'ip_pool',
            'status' => 'status',
            'provider' => 'provider',
        ]);

        return $this->paginated($query->paginate($this->perPage($request)));
    }

    public function queueMetrics(Request $request): JsonResponse
    {
        $query = QueueMetric::query()->orderByDesc('recorded_at');

        $this->applyEquals($query, $request, [
            'queue_name' => 'queue_name',
            'queue_type' => 'queue_type',
            'status' => 'status',
        ]);

        return $this->paginated($query->paginate($this->perPage($request)));
    }

    // ---- Financial -----------------------------------------------------

    public function revenueSnapshots(Request $request): JsonResponse
    {
        $query = RevenueSnapshot::query()->orderByDesc('snapshot_date');

        $this->applyEquals($query, $request, ['snapshot_type' => 'snapshot_type']);
        $this->applyDateRange($query, $request, 'snapshot_date');

        return $this->paginated($query->paginate($this->perPage($request)));
    }

    public function costTracking(Request $request): JsonResponse
    {
        $query = CostTracking::query()->orderByDesc('cost_date');

        $this->applyEquals($query, $request, ['period_type' => 'period_type']);
        $this->applyDateRange($query, $request, 'cost_date');

        return $this->paginated($query->paginate($this->perPage($request)));
    }

    public function pipelineMetrics(Request $request): JsonResponse
    {
        $query = PipelineMetric::query()->orderByDesc('snapshot_date');

        $this->applyDateRange($query, $request, 'snapshot_date');

        return $this->paginated($query->paginate($this->perPage($request)));
    }

    // ---- Actions -------------------------------------------------------

    public function actionDefinitions(Request $request): JsonResponse
    {
        $query = ActionDefinition::query()->orderBy('name');

        $this->applyEquals($query, $request, [
            'category' => 'category',
            'risk_level' => 'risk_level',
        ]);

        if ($request->filled('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        return $this->paginated($query->paginate($this->perPage($request)));
    }

    public function actionExecutions(Request $request): JsonResponse
    {
        $query = ActionExecution::query()->orderByDesc('created_at');

        $this->applyEquals($query, $request, [
            'status' => 'status',
            'action_id' => 'action_id',
            'recommendation_id' => 'recommendation_id',
            'session_id' => 'session_id',
        ]);

        return $this->paginated($query->paginate($this->perPage($request)));
    }

    // ---- Alerts --------------------------------------------------------

    public function alertRules(Request $request): JsonResponse
    {
        $query = AlertRule::query()->orderBy('name');

        $this->applyEquals($query, $request, [
            'category' => 'category',
            'severity' => 'severity',
        ]);

        if ($request->filled('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        return $this->paginated($query->paginate($this->perPage($request)));
    }

    public function alerts(Request $request): JsonResponse
    {
        $query = Alert::query()->orderByDesc('triggered_at');

        $this->applyEquals($query, $request, [
            'status' => 'status',
            'severity' => 'severity',
            'component_id' => 'component_id',
        ]);

        return $this->paginated($query->paginate($this->perPage($request)));
    }

    public function acknowledgeAlert(Request $request, string $id): JsonResponse
    {
        $alert = Alert::findOrFail($id);
        $alert->update([
            'status' => 'acknowledged',
            'acknowledged_at' => now(),
            'acknowledged_by' => $this->actor($request),
        ]);

        return response()->json(['data' => $this->camelKeys($alert->fresh()->attributesToArray())]);
    }

    public function resolveAlert(Request $request, string $id): JsonResponse
    {
        $alert = Alert::findOrFail($id);
        $alert->update([
            'status' => 'resolved',
            'resolved_at' => now(),
            'resolved_by' => $this->actor($request),
            'resolution_notes' => $request->input('notes'),
        ]);

        return response()->json(['data' => $this->camelKeys($alert->fresh()->attributesToArray())]);
    }

    // ---- Progress ------------------------------------------------------

    public function developmentMilestones(Request $request): JsonResponse
    {
        $query = DevelopmentMilestone::query()->orderBy('planned_end');

        $this->applyEquals($query, $request, [
            'status' => 'status',
            'category' => 'category',
            'module' => 'module',
        ]);

        return $this->paginated($query->paginate($this->perPage($request)));
    }

    public function featureFlags(Request $request): JsonResponse
    {
        $query = FeatureFlag::query()->orderBy('name');

        if ($request->filled('is_enabled')) {
            $query->where('is_enabled', $request->boolean('is_enabled'));
        }

        if ($request->filled('tag')) {
            $query->whereJsonContains('tags', $request->query('tag'));
        }

        return $this->paginated($query->paginate($this->perPage($request)));
    }

    // ---- Dashboard snapshot -------------------------------------------

    public function dashboardSnapshot(): JsonResponse
    {
        $revenue = RevenueSnapshot::query()->orderByDesc('snapshot_date')->first();
        $cost = CostTracking::query()->orderByDesc('cost_date')->first();
        $pipeline = PipelineMetric::query()->orderByDesc('snapshot_date')->first();

        $componentsHealthy = (int) InfrastructureComponent::query()->where('current_status', 'healthy')->count();
        $componentsDegraded = (int) InfrastructureComponent::query()->where('current_status', 'degraded')->count();
        $componentsUnhealthy = (int) InfrastructureComponent::query()->where('current_status', 'unhealthy')->count();

        $overallStatus = 'healthy';
        if ($componentsUnhealthy > 0) {
            $overallStatus = 'unhealthy';
        } elseif ($componentsDegraded > 0) {
            $overallStatus = 'degraded';
        }

        $ips = EmailIPReputation::query()->get();
        $activeAlerts = Alert::query()->whereIn('status', ['active', 'acknowledged', 'investigating'])->get();

        $latestQueues = QueueMetric::query()->orderByDesc('recorded_at')->limit(50)->get();

        return response()->json([
            'data' => [
                'asOf' => now()->toIso8601String(),
                'financial' => [
                    'mrr' => (float) ($revenue->mrr ?? 0),
                    'mrrChange30d' => (float) ($revenue->net_new_mrr ?? 0),
                    'mrrChangePercent30d' => (float) ($revenue && (float) $revenue->mrr > 0
                        ? round(((float) ($revenue->net_new_mrr ?? 0) / (float) $revenue->mrr) * 100, 2)
                        : 0),
                    'arr' => (float) ($revenue->arr ?? (($revenue->mrr ?? 0) * 12)),
                    'totalCustomers' => (int) ($revenue->total_paying_customers ?? 0),
                    'netNewCustomers30d' => (int) ($revenue->net_new_customers ?? 0),
                    'churnRate30d' => (float) ($revenue && (int) $revenue->total_paying_customers > 0
                        ? round(((int) ($revenue->churned_customers ?? 0) / (int) $revenue->total_paying_customers) * 100, 2)
                        : 0),
                    'arpu' => (float) ($revenue->arpu ?? 0),
                ],
                'infrastructure' => [
                    'overallStatus' => $overallStatus,
                    'componentsHealthy' => $componentsHealthy,
                    'componentsDegraded' => $componentsDegraded,
                    'componentsUnhealthy' => $componentsUnhealthy,
                    'avgResponseTimeMs' => (float) (HealthCheck::query()
                        ->where('checked_at', '>=', now()->subHour())
                        ->avg('response_time_ms') ?? 0),
                    'errorRate1h' => 0,
                ],
                'email' => [
                    'overallDeliverability' => (float) ($ips->avg('reputation_score') ?? 0),
                    'ipsActive' => (int) $ips->where('status', 'active')->count(),
                    'ipsWarming' => (int) $ips->where('status', 'warming')->count(),
                    'ipsBlacklisted' => (int) $ips->where('status', 'blacklisted')->count(),
                    'bounceRate24h' => (float) ($ips->avg('bounce_rate_24h') ?? 0),
                    'complaintRate24h' => (float) ($ips->avg('complaint_rate_24h') ?? 0),
                    'emailsSent24h' => (int) $ips->sum('emails_sent_24h'),
                ],
                'pipeline' => [
                    'leadsTotal' => (int) ($pipeline->leads_total ?? 0),
                    'prospectsInTrial' => (int) ($pipeline->prospects_in_hook_trial ?? 0),
                    'opportunitiesValue' => (float) ($pipeline->opportunities_value ?? 0),
                    'projectedConversions30d' => (int) ($pipeline->projected_conversions_30d ?? 0),
                    'projectedMrr30d' => (float) ($pipeline->projected_mrr_30d ?? 0),
                ],
                'system' => [
                    'jobsProcessed24h' => (int) $latestQueues->sum('messages_out_1h'),
                    'jobsFailed24h' => (int) $latestQueues->sum('messages_failed_1h'),
                    'queueDepthTotal' => (int) $latestQueues->sum('current_depth'),
                    'oldestQueueItemAge' => (int) ($latestQueues->max('oldest_message_age_seconds') ?? 0),
                ],
                'costs' => [
                    'mtdTotal' => (float) (CostTracking::query()
                        ->where('cost_date', '>=', now()->startOfMonth())
                        ->sum('cost_total')),
                    'mtdBudget' => (float) ($cost->budget_allocated ?? 0),
                    'mtdVariance' => (float) ($cost->budget_variance ?? 0),
                    'projectedMonthEnd' => (float) (($cost->cost_total ?? 0) * (int) now()->daysInMonth),
                    'costPerCustomer' => (float) ($cost->cost_per_customer ?? 0),
                ],
                'alerts' => [
                    'activeTotal' => (int) $activeAlerts->count(),
                    'activeCritical' => (int) $activeAlerts->whereIn('severity', ['critical', 'emergency'])->count(),
                    'activeWarning' => (int) $activeAlerts->where('severity', 'warning')->count(),
                    'incidentsOpen' => (int) Incident::query()
                        ->whereNotIn('status', ['resolved', 'postmortem'])
                        ->count(),
                ],
            ],
        ]);
    }

    private function actor(Request $request): ?string
    {
        $id = $request->user()?->getAuthIdentifier();

        return $id !== null ? (string) $id : null;
    }
}
