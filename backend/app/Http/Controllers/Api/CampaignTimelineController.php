<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CampaignTimeline;
use App\Models\Customer;
use App\Models\CustomerTimelineProgress;
use App\Services\CampaignOrchestratorService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Campaign timeline management endpoints for Command Center operators.
 */
final class CampaignTimelineController extends Controller
{
    public function __construct(
        private readonly CampaignOrchestratorService $orchestrator,
    ) {}

    /**
     * GET /api/v1/crm/campaigns/timeline/progress
     * List all customers with active/paused timelines.
     */
    public function progress(Request $request): JsonResponse
    {
        $query = CustomerTimelineProgress::with(['customer', 'timeline'])
            ->orderBy('started_at', 'desc');

        if ($request->has('status')) {
            $query->where('status', $request->input('status'));
        }

        $progress = $query->paginate($request->integer('per_page', 25));

        $data = $progress->through(function (CustomerTimelineProgress $p) {
            return [
                'id' => $p->id,
                'customer' => [
                    'id' => $p->customer->id,
                    'business_name' => $p->customer->business_name,
                    'email' => $p->customer->email,
                    'pipeline_stage' => $p->customer->pipeline_stage->value,
                ],
                'timeline' => [
                    'id' => $p->timeline->id,
                    'name' => $p->timeline->name,
                    'duration_days' => $p->timeline->duration_days,
                    'pipeline_stage' => $p->timeline->pipeline_stage->value,
                ],
                'current_day' => $p->current_day,
                'status' => $p->status,
                'started_at' => $p->started_at?->toISOString(),
                'last_action_at' => $p->last_action_at?->toISOString(),
                'completed_at' => $p->completed_at?->toISOString(),
                'paused_at' => $p->paused_at?->toISOString(),
                'completed_actions_count' => count($p->completed_actions ?? []),
                'skipped_actions_count' => count($p->skipped_actions ?? []),
            ];
        });

        return response()->json($data);
    }

    /**
     * POST /api/v1/crm/campaigns/timeline/{customer}/enroll
     * Start a customer on their stage-appropriate timeline.
     */
    public function enroll(Request $request, string $customerId): JsonResponse
    {
        $customer = Customer::findOrFail($customerId);

        $timelineId = $request->input('timeline_id');
        if ($timelineId) {
            $timeline = CampaignTimeline::findOrFail($timelineId);
        } else {
            $timeline = CampaignTimeline::getActiveForStage($customer->pipeline_stage);
            if (!$timeline) {
                return response()->json([
                    'error' => 'No active timeline for stage: ' . $customer->pipeline_stage->value,
                ], 422);
            }
        }

        $progress = $this->orchestrator->startTimeline($customer, $timeline);

        return response()->json([
            'data' => [
                'id' => $progress->id,
                'current_day' => $progress->current_day,
                'status' => $progress->status,
                'started_at' => $progress->started_at->toISOString(),
                'timeline' => [
                    'id' => $timeline->id,
                    'name' => $timeline->name,
                    'duration_days' => $timeline->duration_days,
                ],
            ],
            'message' => 'Customer enrolled in timeline',
        ]);
    }

    /**
     * POST /api/v1/crm/campaigns/timeline/{customer}/pause
     */
    public function pause(string $customerId): JsonResponse
    {
        $progress = CustomerTimelineProgress::where('customer_id', $customerId)
            ->where('status', 'active')
            ->first();

        if (!$progress) {
            return response()->json(['error' => 'No active timeline to pause'], 422);
        }

        $this->orchestrator->pauseTimeline($progress);

        return response()->json(['message' => 'Timeline paused', 'status' => 'paused']);
    }

    /**
     * POST /api/v1/crm/campaigns/timeline/{customer}/resume
     */
    public function resume(string $customerId): JsonResponse
    {
        $progress = CustomerTimelineProgress::where('customer_id', $customerId)
            ->where('status', 'paused')
            ->first();

        if (!$progress) {
            return response()->json(['error' => 'No paused timeline to resume'], 422);
        }

        $this->orchestrator->resumeTimeline($progress);

        return response()->json(['message' => 'Timeline resumed', 'status' => 'active']);
    }

    /**
     * GET /api/v1/crm/campaigns/timeline/available
     * List all available timelines for enrollment.
     */
    public function available(): JsonResponse
    {
        $timelines = CampaignTimeline::where('is_active', true)
            ->withCount('customerProgress')
            ->get()
            ->map(fn (CampaignTimeline $t) => [
                'id' => $t->id,
                'name' => $t->name,
                'slug' => $t->slug,
                'pipeline_stage' => $t->pipeline_stage->value,
                'duration_days' => $t->duration_days,
                'active_enrollments' => $t->customer_progress_count,
            ]);

        return response()->json(['data' => $timelines]);
    }
}
