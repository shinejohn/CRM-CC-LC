<?php

namespace App\Http\Controllers\Api;

use App\Contracts\Emergency\EmergencyBroadcastServiceInterface;
use App\Http\Controllers\Controller;
use App\Models\Emergency\EmergencyBroadcast;
use App\Models\Emergency\EmergencyCategory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class EmergencyBroadcastController extends Controller
{
    public function __construct(
        private EmergencyBroadcastServiceInterface $emergencyService
    ) {}

    /**
     * List emergency broadcasts
     */
    public function index(Request $request): JsonResponse
    {
        $query = EmergencyBroadcast::query()
            ->with('authorizer')
            ->orderBy('created_at', 'desc');

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by category
        if ($request->has('category')) {
            $query->where('category', $request->category);
        }

        // Filter by community
        if ($request->has('community_id')) {
            $query->whereJsonContains('community_ids', $request->community_id);
        }

        $broadcasts = $query->paginate($request->get('per_page', 20));

        return response()->json($broadcasts);
    }

    /**
     * Create emergency broadcast
     */
    public function create(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'message' => 'required|string',
            'instructions' => 'nullable|string',
            'category' => 'required|string|exists:emergency_categories,slug',
            'severity' => 'required|in:critical,severe,moderate',
            'community_ids' => 'required|array',
            'community_ids.*' => 'required|exists:communities,id',
            'send_email' => 'boolean',
            'send_sms' => 'boolean',
            'send_push' => 'boolean',
            'send_voice' => 'boolean',
            'authorization_pin' => 'required|string|size:6',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $broadcast = $this->emergencyService->create(
                $validator->validated(),
                $request->input('authorization_pin')
            );

            return response()->json([
                'message' => 'Emergency broadcast created and authorized successfully.',
                'broadcast' => $broadcast->load('authorizer'),
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Get emergency broadcast
     */
    public function show(int $id): JsonResponse
    {
        $broadcast = EmergencyBroadcast::with(['authorizer', 'auditLogs.user'])
            ->findOrFail($id);

        return response()->json([
            'broadcast' => $broadcast,
        ]);
    }

    /**
     * Send emergency broadcast
     */
    public function send(int $id): JsonResponse
    {
        try {
            $result = $this->emergencyService->send($id);

            return response()->json([
                'message' => 'Emergency broadcast sending started.',
                'result' => $result,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Cancel emergency broadcast
     */
    public function cancel(Request $request, int $id): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'reason' => 'required|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $this->emergencyService->cancel($id, $request->input('reason'));

            return response()->json([
                'message' => 'Emergency broadcast cancelled successfully.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Send test broadcast
     */
    public function sendTest(Request $request, int $id): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'test_recipients' => 'required|array|max:5',
            'test_recipients.*' => 'required|email',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $result = $this->emergencyService->sendTest($id, $request->input('test_recipients'));

            return response()->json([
                'message' => 'Test broadcast sent successfully.',
                'result' => $result,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Get delivery status
     */
    public function status(int $id): JsonResponse
    {
        $status = $this->emergencyService->getDeliveryStatus($id);

        return response()->json($status);
    }

    /**
     * Get categories
     */
    public function categories(): JsonResponse
    {
        $categories = EmergencyCategory::orderBy('display_order')->get();

        return response()->json([
            'categories' => $categories,
        ]);
    }

    /**
     * Get audit log
     */
    public function auditLog(int $id): JsonResponse
    {
        $broadcast = EmergencyBroadcast::findOrFail($id);
        $auditLogs = $broadcast->auditLogs()
            ->with('user')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'audit_logs' => $auditLogs,
        ]);
    }
}



