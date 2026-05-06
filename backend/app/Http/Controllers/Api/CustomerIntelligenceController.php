<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Services\CustomerIntelligenceService;
use Illuminate\Http\JsonResponse;

final class CustomerIntelligenceController extends Controller
{
    public function __construct(
        private readonly CustomerIntelligenceService $intelligenceService,
    ) {}

    /**
     * GET /api/v1/customers/{customerId}/intelligence
     */
    public function show(string $customerId): JsonResponse
    {
        $customer = Customer::findOrFail($customerId);
        $context = $this->intelligenceService->buildContext($customer);

        return response()->json(['data' => $context]);
    }
}
