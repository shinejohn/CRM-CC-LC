<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Approval;
use App\Services\ApprovalService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ApprovalController extends Controller
{
    public function __construct(
        protected ApprovalService $approvalService
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $query = Approval::query();

        if ($request->filled('customer_id')) {
            $query->where('customer_id', $request->input('customer_id'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('service_type')) {
            $query->where('service_type', $request->input('service_type'));
        }

        $approvals = $query->with('customer:id,business_name')
            ->latest('approved_at')
            ->paginate($request->input('per_page', 20));

        return response()->json([
            'data' => $approvals->items(),
            'meta' => [
                'current_page' => $approvals->currentPage(),
                'last_page' => $approvals->lastPage(),
                'per_page' => $approvals->perPage(),
                'total' => $approvals->total(),
            ],
        ]);
    }

    public function show(Approval $approval): JsonResponse
    {
        return response()->json([
            'data' => $approval->load(['customer', 'upsells', 'provisioningTask']),
        ]);
    }

    public function provision(Approval $approval): JsonResponse
    {
        if ($approval->status !== 'pending') {
            return response()->json(['error' => 'Approval not in pending status'], 400);
        }

        $this->approvalService->startProvisioning($approval->id);

        return response()->json(['message' => 'Provisioning started']);
    }

    public function cancel(Approval $approval): JsonResponse
    {
        if ($approval->status === 'provisioned') {
            return response()->json(['error' => 'Cannot cancel provisioned approval'], 400);
        }

        $approval->update(['status' => 'cancelled']);

        return response()->json(['message' => 'Approval cancelled']);
    }
}

