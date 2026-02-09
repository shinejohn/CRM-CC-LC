<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ProvisioningTask;
use App\Services\ApprovalService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProvisioningTaskController extends Controller
{
    public function __construct(
        protected ApprovalService $approvalService
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $query = ProvisioningTask::query();

        if ($request->filled('customer_id')) {
            $query->where('customer_id', $request->input('customer_id'));
        }

        if ($request->filled('approval_id')) {
            $query->where('approval_id', $request->input('approval_id'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('service_type')) {
            $query->where('service_type', $request->input('service_type'));
        }

        $tasks = $query->with(['approval', 'customer'])
            ->latest()
            ->paginate($request->input('per_page', 20));

        return response()->json([
            'data' => $tasks->items(),
            'meta' => [
                'current_page' => $tasks->currentPage(),
                'last_page' => $tasks->lastPage(),
                'per_page' => $tasks->perPage(),
                'total' => $tasks->total(),
            ],
        ]);
    }

    public function show(ProvisioningTask $provisioningTask): JsonResponse
    {
        return response()->json([
            'data' => $provisioningTask->load(['approval', 'customer']),
        ]);
    }

    public function retry(ProvisioningTask $provisioningTask): JsonResponse
    {
        if ($provisioningTask->status !== 'failed') {
            return response()->json(['error' => 'Task not in failed status'], 400);
        }

        $provisioningTask->update([
            'status' => 'queued',
            'failed_at' => null,
            'failure_reason' => null,
            'started_at' => null,
            'completed_at' => null,
        ]);

        $provisionerClass = $this->approvalService->getProvisionerClass($provisioningTask->service_type);
        $provisionerClass::dispatch($provisioningTask->id);

        return response()->json(['message' => 'Provisioning retry started']);
    }
}

