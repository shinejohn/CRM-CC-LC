<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Enums\PipelineStage;
use App\Http\Controllers\Controller;
use App\Models\CampaignTimeline;
use App\Models\Customer;
use App\Models\CustomerTimelineProgress;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

final class ManifestDestinyCampaignController extends Controller
{
    /**
     * GET /api/v1/campaigns/manifest-destiny/stats
     *
     * Aggregate dashboard: enrollment counts, pipeline distribution,
     * daily action velocity, and top-performing timelines.
     */
    public function stats(Request $request): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');

        // --- Pipeline stage distribution ---
        $byStage = Customer::when($tenantId, fn ($q) => $q->where('tenant_id', $tenantId))
            ->whereNotNull('pipeline_stage')
            ->select('pipeline_stage', DB::raw('COUNT(*) as count'))
            ->groupBy('pipeline_stage')
            ->get()
            ->mapWithKeys(fn ($row) => [$row->pipeline_stage => (int) $row->count])
            ->toArray();

        $stageBreakdown = [];
        foreach (PipelineStage::orderedStages() as $stage) {
            $stageBreakdown[] = [
                'stage'  => $stage->value,
                'label'  => $stage->label(),
                'color'  => $stage->color(),
                'count'  => $byStage[$stage->value] ?? 0,
            ];
        }

        // --- Timeline enrollment summary ---
        $enrollments = CustomerTimelineProgress::select(
            'campaign_timeline_id',
            'status',
            DB::raw('COUNT(*) as count')
        )
            ->groupBy('campaign_timeline_id', 'status')
            ->with('timeline:id,name,slug,pipeline_stage')
            ->get();

        $timelineStats = [];
        foreach ($enrollments as $row) {
            $key = $row->campaign_timeline_id;
            if (!isset($timelineStats[$key])) {
                $timelineStats[$key] = [
                    'timeline_id'   => $key,
                    'name'          => $row->timeline?->name ?? 'Unknown',
                    'slug'          => $row->timeline?->slug ?? '',
                    'pipeline_stage'=> $row->timeline?->pipeline_stage?->value ?? '',
                    'active'        => 0,
                    'completed'     => 0,
                    'paused'        => 0,
                    'total'         => 0,
                ];
            }
            $timelineStats[$key][$row->status] = (int) $row->count;
            $timelineStats[$key]['total'] += (int) $row->count;
        }

        // --- Overall enrollment counts ---
        $totalEnrolled  = CustomerTimelineProgress::where('status', 'active')->count();
        $totalCompleted = CustomerTimelineProgress::where('status', 'completed')->count();
        $totalPaused    = CustomerTimelineProgress::where('status', 'paused')->count();

        // --- Customers with no timeline (not yet enrolled) ---
        $unenrolledCount = Customer::when($tenantId, fn ($q) => $q->where('tenant_id', $tenantId))
            ->whereDoesntHave('timelineProgress')
            ->where('email_suppressed', false)
            ->count();

        // --- Actions executed in last 7 days (approx: progress rows updated) ---
        $recentActivity = CustomerTimelineProgress::where('last_action_at', '>=', now()->subDays(7))
            ->count();

        // --- Day-by-day distribution of currently enrolled customers ---
        $dayDistribution = CustomerTimelineProgress::where('status', 'active')
            ->select('current_day', DB::raw('COUNT(*) as count'))
            ->groupBy('current_day')
            ->orderBy('current_day')
            ->limit(90)
            ->get()
            ->map(fn ($r) => ['day' => (int) $r->current_day, 'count' => (int) $r->count])
            ->values();

        return response()->json([
            'data' => [
                'pipeline'   => $stageBreakdown,
                'enrollment' => [
                    'active'      => $totalEnrolled,
                    'completed'   => $totalCompleted,
                    'paused'      => $totalPaused,
                    'unenrolled'  => $unenrolledCount,
                ],
                'timelines'          => array_values($timelineStats),
                'recent_activity_7d' => $recentActivity,
                'day_distribution'   => $dayDistribution,
            ],
        ]);
    }

    /**
     * GET /api/v1/campaigns/manifest-destiny/timelines
     *
     * List all campaign timelines with enrollment counts.
     */
    public function timelines(): JsonResponse
    {
        $timelines = CampaignTimeline::where('is_active', true)
            ->withCount(['actions', 'customerProgress as enrolled_count' => fn ($q) => $q->where('status', 'active')])
            ->orderBy('pipeline_stage')
            ->get()
            ->map(fn (CampaignTimeline $t) => [
                'id'             => $t->id,
                'name'           => $t->name,
                'slug'           => $t->slug,
                'pipeline_stage' => $t->pipeline_stage->value,
                'duration_days'  => $t->duration_days,
                'action_count'   => $t->actions_count,
                'enrolled_count' => $t->enrolled_count,
                'description'    => $t->description,
            ]);

        return response()->json(['data' => $timelines]);
    }
}
