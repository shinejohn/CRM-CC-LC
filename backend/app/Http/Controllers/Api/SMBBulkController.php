<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Jobs\ImportSMBs;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Bus;

final class SMBBulkController extends Controller
{
    /**
     * Columns an operator is allowed to set via bulk update.
     *
     * Deliberately excludes tenant_id, id, and any suppression / consent /
     * pipeline privilege fields (email_suppressed, do_not_contact,
     * pipeline_stage, opt-in flags) so they can never be mass-assigned here.
     */
    private const BULK_UPDATABLE_COLUMNS = [
        'engagement_tier',
        'campaign_status',
        'current_campaign_id',
        'service_model',
        'subscription_tier',
        'assigned_rep',
        'lead_source',
        'lead_score',
        'notes',
        'tags',
    ];

    /**
     * Resolve the active tenant strictly from the authenticated user.
     * Never trust a client-supplied header or request body for tenant identity.
     */
    private function tenantId(Request $request): string
    {
        $tenantId = $request->user()?->tenant_id;

        abort_if(empty($tenantId), 403, 'Forbidden: no tenant assigned to this account.');

        return (string) $tenantId;
    }

    /**
     * Bulk import SMBs
     */
    public function import(Request $request): JsonResponse
    {
        $tenantId = $this->tenantId($request);

        $validated = $request->validate([
            'file' => 'required|file|mimes:csv,txt,json',
            'community_id' => 'nullable|uuid',
            'options' => 'nullable|array',
        ]);

        $file = $request->file('file');
        $path = $file->store('imports');

        $job = new ImportSMBs(
            $path,
            $tenantId,
            $validated['community_id'] ?? null,
            $validated['options'] ?? []
        );

        $batch = Bus::batch([$job])->dispatch();

        return response()->json([
            'data' => [
                'job_id' => $batch->id,
                'status' => 'queued',
            ],
            'message' => 'Import job queued successfully',
        ], 202);
    }

    /**
     * Get import status
     */
    public function importStatus(string $jobId): JsonResponse
    {
        $batch = Bus::findBatch($jobId);

        if (!$batch) {
            return response()->json(['error' => 'Job not found'], 404);
        }

        return response()->json([
            'data' => [
                'job_id' => $batch->id,
                'status' => $batch->finished() ? 'completed' : 'processing',
                'total_jobs' => $batch->totalJobs,
                'pending_jobs' => $batch->pendingJobs,
                'failed_jobs' => $batch->failedJobs,
                'processed_jobs' => $batch->processedJobs(),
            ],
        ]);
    }

    /**
     * Bulk update SMBs
     */
    public function bulkUpdate(Request $request): JsonResponse
    {
        $tenantId = $this->tenantId($request);

        $validated = $request->validate([
            'filters' => 'required|array',
            'updates' => 'required|array',
        ]);

        // Whitelist updatable columns — anything not explicitly allowed
        // (tenant_id, id, suppression / consent / pipeline fields, …) is dropped.
        $updates = array_intersect_key(
            $validated['updates'],
            array_flip(self::BULK_UPDATABLE_COLUMNS)
        );

        if (empty($updates)) {
            return response()->json([
                'error' => 'No updatable columns provided. Allowed columns: '
                    . implode(', ', self::BULK_UPDATABLE_COLUMNS),
            ], 422);
        }

        $query = Customer::where('tenant_id', $tenantId);

        // Apply filters
        if (isset($validated['filters']['community_id'])) {
            $query->where('community_id', $validated['filters']['community_id']);
        }

        if (isset($validated['filters']['engagement_tier'])) {
            $query->where('engagement_tier', $validated['filters']['engagement_tier']);
        }

        if (isset($validated['filters']['campaign_status'])) {
            $query->where('campaign_status', $validated['filters']['campaign_status']);
        }

        $count = $query->update($updates);

        return response()->json([
            'data' => [
                'updated_count' => $count,
            ],
            'message' => "Updated {$count} SMBs successfully",
        ]);
    }
}
