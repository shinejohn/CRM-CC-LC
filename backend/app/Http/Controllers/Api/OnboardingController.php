<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Services\OnboardingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class OnboardingController extends Controller
{
    public function __construct(
        private OnboardingService $onboarding
    ) {}

    /**
     * GET /api/v1/onboarding
     *
     * Returns the onboarding checklist for the current customer.
     */
    public function index(Request $request): JsonResponse
    {
        $customer = $this->resolveCustomer($request);

        if (! $customer) {
            return response()->json(['message' => 'No customer found for the current account.'], 404);
        }

        // Ensure rows exist so progress can be recorded (idempotent).
        $this->onboarding->seedFor($customer);

        return response()->json($this->onboarding->summaryFor($customer));
    }

    /**
     * POST /api/v1/onboarding/{step}/complete
     *
     * Marks a step complete and returns the updated checklist.
     */
    public function complete(Request $request, string $step): JsonResponse
    {
        $customer = $this->resolveCustomer($request);

        if (! $customer) {
            return response()->json(['message' => 'No customer found for the current account.'], 404);
        }

        $progress = $this->onboarding->markComplete($customer, $step);

        if (! $progress) {
            return response()->json(['message' => "Unknown onboarding step: {$step}"], 422);
        }

        return response()->json($this->onboarding->summaryFor($customer));
    }

    /**
     * Resolve the Customer for the current request.
     *
     * Consistent with the rest of the API, the tenant is derived from the
     * X-Tenant-ID header (or tenant_id input), falling back to the
     * authenticated user's tenant_id. The onboarding checklist belongs to the
     * Customer whose tenant_id matches the resolved tenant.
     */
    private function resolveCustomer(Request $request): ?Customer
    {
        $tenantId = $request->header('X-Tenant-ID')
            ?? $request->input('tenant_id')
            ?? $request->user()?->tenant_id;

        if (! $tenantId) {
            return null;
        }

        return Customer::query()
            ->where('tenant_id', $tenantId)
            ->orderBy('created_at')
            ->first();
    }
}
