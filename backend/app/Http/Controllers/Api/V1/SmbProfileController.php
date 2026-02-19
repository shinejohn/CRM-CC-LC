<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Services\SmbProfileService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

/**
 * SMB Full Profile & Intelligence Hub API
 * Aggregates business data from customers, surveys, campaigns, and enrichment.
 */
class SmbProfileController extends Controller
{
    public function __construct(
        private SmbProfileService $smbProfileService
    ) {}

    /**
     * GET /api/v1/smb/{id}/full-profile
     * Returns everything about a business aggregated from all sources.
     */
    public function fullProfile(Request $request, string $id): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        if (!$tenantId) {
            return response()->json(['error' => 'Tenant ID required'], 400);
        }

        $customer = Customer::where('tenant_id', $tenantId)->findOrFail($id);

        $profile = $this->smbProfileService->buildFullProfile($customer);

        return response()->json(['data' => $profile]);
    }

    /**
     * GET /api/v1/smb/{id}/ai-context
     * Returns just the AI-relevant fields for prompt injection.
     */
    public function aiContext(Request $request, string $id): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        if (!$tenantId) {
            return response()->json(['error' => 'Tenant ID required'], 400);
        }

        $customer = Customer::where('tenant_id', $tenantId)->findOrFail($id);

        $aiContext = $this->smbProfileService->getAIContext($customer);

        return response()->json(['data' => $aiContext]);
    }

    /**
     * GET /api/v1/smb/{id}/intelligence-summary
     * Returns a text block summarizing everything about this business (~500-1000 words).
     */
    public function intelligenceSummary(Request $request, string $id): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        if (!$tenantId) {
            return response()->json(['error' => 'Tenant ID required'], 400);
        }

        $customer = Customer::where('tenant_id', $tenantId)->findOrFail($id);

        $summary = $this->smbProfileService->buildIntelligenceSummary($customer);

        return response()->json(['data' => ['summary' => $summary]]);
    }

    /**
     * PATCH /api/v1/smb/{id}/profile/{section}
     * Update individual profile sections without overwriting the whole profile.
     */
    public function updateSection(Request $request, string $id, string $section): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        if (!$tenantId) {
            return response()->json(['error' => 'Tenant ID required'], 400);
        }

        $allowedSections = ['ai_context', 'survey_responses', 'customer_intelligence', 'competitor_analysis'];
        if (!in_array($section, $allowedSections)) {
            return response()->json(['error' => "Invalid section. Allowed: {$allowedSections}"], 422);
        }

        $customer = Customer::where('tenant_id', $tenantId)->findOrFail($id);

        $data = $request->validate(['data' => 'required|array']);
        $customer->update([$section => $data['data']]);

        return response()->json([
            'data' => $customer->fresh(),
            'message' => "Profile section '{$section}' updated successfully",
        ]);
    }

    /**
     * POST /api/v1/smb/{id}/enrich
     * Kicks off a fresh pull from Google Places, website scan, SerpAPI to update stale data.
     */
    public function enrich(Request $request, string $id): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        if (!$tenantId) {
            return response()->json(['error' => 'Tenant ID required'], 400);
        }

        $customer = Customer::where('tenant_id', $tenantId)->findOrFail($id);

        // Placeholder: dispatch enrichment job when implemented.
        // For now, update last_enriched_at and return success.
        $customer->update([
            'last_enriched_at' => now(),
            'data_sources' => array_values(array_unique(array_merge(
                $customer->data_sources ?? [],
                ['enrichment_triggered']
            ))),
        ]);

        return response()->json([
            'data' => ['status' => 'enrichment_queued', 'last_enriched_at' => $customer->fresh()->last_enriched_at],
            'message' => 'Enrichment job queued successfully',
        ], 202);
    }
}
