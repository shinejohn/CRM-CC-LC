<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\CrmAdvancedAnalyticsService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class CrmAdvancedAnalyticsController extends Controller
{
    public function __construct(
        private CrmAdvancedAnalyticsService $analyticsService
    ) {}

    /**
     * Get customer engagement score
     */
    public function engagementScore(Request $request, string $customerId): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        if (!$tenantId) {
            return response()->json(['error' => 'Tenant ID required'], 400);
        }

        try {
            $score = $this->analyticsService->calculateEngagementScore($customerId, $tenantId);

            return response()->json([
                'data' => [
                    'customer_id' => $customerId,
                    'engagement_score' => $score,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to calculate engagement score',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get campaign ROI
     */
    public function campaignROI(Request $request, string $campaignId): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        if (!$tenantId) {
            return response()->json(['error' => 'Tenant ID required'], 400);
        }

        $days = (int) ($request->input('days', 30));

        try {
            $roi = $this->analyticsService->calculateCampaignROI($campaignId, $tenantId, $days);

            return response()->json([
                'data' => $roi,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to calculate campaign ROI',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get predictive lead score
     */
    public function predictiveScore(Request $request, string $customerId): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        if (!$tenantId) {
            return response()->json(['error' => 'Tenant ID required'], 400);
        }

        try {
            $prediction = $this->analyticsService->calculatePredictiveLeadScore($customerId, $tenantId);

            return response()->json([
                'data' => $prediction,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to calculate predictive score',
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}
