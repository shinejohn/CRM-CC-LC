<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Services\SubscriberROIService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SubscriberROIController extends Controller
{
    public function __construct(
        private SubscriberROIService $roiService
    ) {}

    public function currentMonth(Request $request, string $customerId): JsonResponse
    {
        $customer = $this->tenantCustomerOrFail($request, $customerId);
        $yearMonth = now()->format('Y-m');
        $report = $this->roiService->generateReport($customer, $yearMonth);

        if (isset($report['error'])) {
            return response()->json(['error' => $report['error']], 422);
        }

        return response()->json(['data' => $report]);
    }

    public function monthReport(Request $request, string $customerId, string $yearMonth): JsonResponse
    {
        $customer = $this->tenantCustomerOrFail($request, $customerId);
        $report = $this->roiService->generateReport($customer, $yearMonth);

        if (isset($report['error'])) {
            return response()->json(['error' => $report['error']], 422);
        }

        return response()->json(['data' => $report]);
    }

    public function summary(Request $request, string $customerId): JsonResponse
    {
        $customer = $this->tenantCustomerOrFail($request, $customerId);
        $summary = $this->roiService->generateSummary($customer);

        if (isset($summary['error'])) {
            return response()->json(['error' => $summary['error']], 422);
        }

        return response()->json(['data' => $summary]);
    }

    private function tenantCustomerOrFail(Request $request, string $customerId): Customer
    {
        $user = $request->user();
        $tenantId = (string) ($user->tenant_id ?? $user->id);

        return Customer::query()
            ->withoutGlobalScopes()
            ->where('id', $customerId)
            ->where('tenant_id', $tenantId)
            ->firstOrFail();
    }
}
