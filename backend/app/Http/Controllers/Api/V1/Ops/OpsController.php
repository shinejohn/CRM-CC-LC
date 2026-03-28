<?php

namespace App\Http\Controllers\Api\V1\Ops;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class OpsController extends Controller
{
    private function tryQuery(\Closure $query)
    {
        try {
            return response()->json(['data' => $query()]);
        } catch (\Exception $e) {
            Log::warning('OpsController query failed: '.$e->getMessage());

            return response()->json(['data' => []]);
        }
    }

    public function getMetrics(): JsonResponse
    {
        return $this->tryQuery(fn () => DB::table('metric_aggregates')
            ->orderBy('id', 'desc')
            ->limit(100)
            ->get());
    }

    public function getHealthChecks(): JsonResponse
    {
        return $this->tryQuery(fn () => DB::table('channel_health')->get());
    }

    public function getQueueMetrics(): JsonResponse
    {
        return $this->tryQuery(fn () => DB::table('message_queue')
            ->select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get());
    }

    public function getCosts(): JsonResponse
    {
        return $this->tryQuery(fn () => DB::table('cost_tracking')
            ->orderBy('created_at', 'desc')
            ->limit(50)
            ->get());
    }

    public function getIncidents(): JsonResponse
    {
        return $this->tryQuery(fn () => DB::table('action_executions')
            ->where('status', 'failed')
            ->orderBy('created_at', 'desc')
            ->limit(50)
            ->get());
    }

    public function getPipelineMetrics(): JsonResponse
    {
        return $this->tryQuery(fn () => DB::table('pipeline_metrics')
            ->orderBy('created_at', 'desc')
            ->limit(50)
            ->get());
    }

    public function getActionDefinitions(): JsonResponse
    {
        return $this->tryQuery(fn () => DB::table('action_definitions')->get());
    }

    public function getMetricDefinitions(): JsonResponse
    {
        return $this->tryQuery(fn () => DB::table('metric_definitions')->get());
    }

    public function getSystemStatus(): JsonResponse
    {
        try {
            $failedCount = DB::table('action_executions')->where('status', 'failed')->count();
            $queuesPending = DB::table('message_queue')->where('status', 'pending')->count();

            return response()->json([
                'data' => [
                    'status' => $failedCount > 10 ? 'degraded' : 'healthy',
                    'incidents_active' => $failedCount,
                    'queue_backlog' => $queuesPending,
                    'last_updated' => now()->toIso8601String(),
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'data' => [
                    'status' => 'unknown',
                    'incidents_active' => 0,
                    'queue_backlog' => 0,
                    'last_updated' => now()->toIso8601String(),
                ],
            ]);
        }
    }
}
