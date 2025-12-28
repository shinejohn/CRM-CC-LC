<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\GeneratedContent;
use App\Models\GeneratedAd;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class PublishingController extends Controller
{
    /**
     * Get publishing dashboard data
     */
    public function dashboard(Request $request): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        if (!$tenantId) {
            return response()->json(['error' => 'Tenant ID required'], 400);
        }

        $startDate = $request->input('start_date', Carbon::now()->subDays(30)->toDateString());
        $endDate = $request->input('end_date', Carbon::now()->toDateString());

        // Content statistics
        $contentStats = GeneratedContent::where('tenant_id', $tenantId)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->selectRaw('
                COUNT(*) as total,
                COUNT(CASE WHEN status = "published" THEN 1 END) as published,
                COUNT(CASE WHEN status = "draft" THEN 1 END) as draft,
                COUNT(CASE WHEN status = "review" THEN 1 END) as review,
                COUNT(CASE WHEN type = "article" THEN 1 END) as articles,
                COUNT(CASE WHEN type = "blog" THEN 1 END) as blogs,
                COUNT(CASE WHEN type = "social" THEN 1 END) as social
            ')
            ->first();

        // Ad statistics
        $adStats = GeneratedAd::where('tenant_id', $tenantId)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->selectRaw('
                COUNT(*) as total,
                COUNT(CASE WHEN status = "active" THEN 1 END) as active,
                COUNT(CASE WHEN status = "scheduled" THEN 1 END) as scheduled,
                SUM(impressions) as total_impressions,
                SUM(clicks) as total_clicks,
                SUM(spend) as total_spend
            ')
            ->first();

        // Recent content
        $recentContent = GeneratedContent::where('tenant_id', $tenantId)
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get(['id', 'title', 'type', 'status', 'created_at']);

        // Recent ads
        $recentAds = GeneratedAd::where('tenant_id', $tenantId)
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get(['id', 'name', 'platform', 'status', 'created_at']);

        return response()->json([
            'data' => [
                'content_stats' => $contentStats,
                'ad_stats' => $adStats,
                'recent_content' => $recentContent,
                'recent_ads' => $recentAds,
            ],
        ]);
    }

    /**
     * Get content calendar (scheduled items)
     */
    public function calendar(Request $request): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        if (!$tenantId) {
            return response()->json(['error' => 'Tenant ID required'], 400);
        }

        $startDate = $request->input('start_date', Carbon::now()->startOfMonth()->toDateString());
        $endDate = $request->input('end_date', Carbon::now()->endOfMonth()->toDateString());

        // Scheduled content
        $scheduledContent = GeneratedContent::where('tenant_id', $tenantId)
            ->whereNotNull('scheduled_publish_at')
            ->whereBetween('scheduled_publish_at', [$startDate, $endDate])
            ->get(['id', 'title', 'type', 'status', 'scheduled_publish_at']);

        // Scheduled ads
        $scheduledAds = GeneratedAd::where('tenant_id', $tenantId)
            ->whereNotNull('scheduled_start_at')
            ->where(function ($query) use ($startDate, $endDate) {
                $query->whereBetween('scheduled_start_at', [$startDate, $endDate])
                      ->orWhereBetween('scheduled_end_at', [$startDate, $endDate]);
            })
            ->get(['id', 'name', 'platform', 'status', 'scheduled_start_at', 'scheduled_end_at']);

        return response()->json([
            'data' => [
                'content' => $scheduledContent,
                'ads' => $scheduledAds,
            ],
        ]);
    }

    /**
     * Publish content
     */
    public function publishContent(Request $request, string $id): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        $content = GeneratedContent::where('tenant_id', $tenantId)->findOrFail($id);

        $validator = Validator::make($request->all(), [
            'channels' => 'nullable|array',
            'channels.*' => 'string',
            'publishing_metadata' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $oldStatus = $content->status;

        $content->update([
            'status' => 'published',
            'published_at' => now(),
            'published_channels' => $request->input('channels', []),
            'publishing_metadata' => $request->input('publishing_metadata', []),
        ]);

        // Record workflow action
        $content->recordWorkflowAction(
            'published',
            $oldStatus,
            'published',
            null,
            $request->input('notes')
        );

        return response()->json([
            'data' => $content->fresh(),
            'message' => 'Content published successfully',
        ]);
    }

    /**
     * Get publishing analytics
     */
    public function analytics(Request $request): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        if (!$tenantId) {
            return response()->json(['error' => 'Tenant ID required'], 400);
        }

        $startDate = $request->input('start_date', Carbon::now()->subDays(30)->toDateString());
        $endDate = $request->input('end_date', Carbon::now()->toDateString());

        // Content publishing over time
        $contentOverTime = GeneratedContent::where('tenant_id', $tenantId)
            ->where('status', 'published')
            ->whereBetween('published_at', [$startDate, $endDate])
            ->selectRaw('CAST(published_at AS DATE) as date, COUNT(*) as count')
            ->groupBy(DB::raw('CAST(published_at AS DATE)'))
            ->orderBy('date')
            ->get();

        // Ad performance
        $adPerformance = GeneratedAd::where('tenant_id', $tenantId)
            ->where('status', 'active')
            ->whereBetween('started_at', [$startDate, $endDate])
            ->selectRaw('
                platform,
                COUNT(*) as ad_count,
                SUM(impressions) as impressions,
                SUM(clicks) as clicks,
                SUM(spend) as spend,
                AVG(clicks * 100.0 / NULLIF(impressions, 0)) as avg_ctr,
                AVG(spend / NULLIF(clicks, 0)) as avg_cpc
            ')
            ->groupBy('platform')
            ->get();

        return response()->json([
            'data' => [
                'content_over_time' => $contentOverTime,
                'ad_performance' => $adPerformance,
            ],
        ]);
    }
}
