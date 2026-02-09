<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Jobs\ImportSMBs;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Bus;

class SMBBulkController extends Controller
{
    /**
     * Bulk import SMBs
     */
    public function import(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'file' => 'required|file|mimes:csv,txt,json',
            'tenant_id' => 'required|uuid',
            'community_id' => 'nullable|uuid',
            'options' => 'nullable|array',
        ]);

        $file = $request->file('file');
        $path = $file->store('imports');

        $job = new ImportSMBs(
            $path,
            $validated['tenant_id'],
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
        $validated = $request->validate([
            'tenant_id' => 'required|uuid',
            'filters' => 'required|array',
            'updates' => 'required|array',
        ]);

        $query = Customer::where('tenant_id', $validated['tenant_id']);

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

        $count = $query->update($validated['updates']);

        return response()->json([
            'data' => [
                'updated_count' => $count,
            ],
            'message' => "Updated {$count} SMBs successfully",
        ]);
    }
}
