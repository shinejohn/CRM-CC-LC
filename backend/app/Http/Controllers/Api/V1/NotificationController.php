<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\CrmNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * List notifications for tenant.
     */
    public function index(Request $request): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        if (!$tenantId) {
            return response()->json(['error' => 'Tenant ID required'], 400);
        }

        $query = CrmNotification::where('tenant_id', $tenantId)
            ->orderBy('created_at', 'desc');

        if ($request->boolean('unread_only')) {
            $query->where('read', false)->where('archived', false);
        }

        if ($request->boolean('important_only')) {
            $query->where('important', true)->where('archived', false);
        }

        if ($request->boolean('archived_only')) {
            $query->where('archived', true);
        }

        $perPage = min((int) $request->input('per_page', 50), 100);
        $notifications = $query->paginate($perPage);

        return response()->json([
            'data' => $notifications->items(),
            'meta' => [
                'current_page' => $notifications->currentPage(),
                'last_page' => $notifications->lastPage(),
                'per_page' => $notifications->perPage(),
                'total' => $notifications->total(),
                'unread_count' => CrmNotification::where('tenant_id', $tenantId)
                    ->where('read', false)
                    ->where('archived', false)
                    ->count(),
            ],
        ]);
    }

    /**
     * Mark notification as read.
     */
    public function markRead(Request $request, string $id): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        if (!$tenantId) {
            return response()->json(['error' => 'Tenant ID required'], 400);
        }

        $notification = CrmNotification::where('tenant_id', $tenantId)->findOrFail($id);
        $notification->read = true;
        $notification->read_at = now();
        $notification->save();

        return response()->json(['data' => $notification]);
    }

    /**
     * Mark all notifications as read.
     */
    public function markAllRead(Request $request): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        if (!$tenantId) {
            return response()->json(['error' => 'Tenant ID required'], 400);
        }

        CrmNotification::where('tenant_id', $tenantId)
            ->where('read', false)
            ->update(['read' => true, 'read_at' => now()]);

        return response()->json(['message' => 'All notifications marked as read']);
    }

    /**
     * Toggle important flag.
     */
    public function toggleImportant(Request $request, string $id): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        if (!$tenantId) {
            return response()->json(['error' => 'Tenant ID required'], 400);
        }

        $notification = CrmNotification::where('tenant_id', $tenantId)->findOrFail($id);
        $notification->important = !$notification->important;
        $notification->save();

        return response()->json(['data' => $notification]);
    }

    /**
     * Archive notification.
     */
    public function archive(Request $request, string $id): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        if (!$tenantId) {
            return response()->json(['error' => 'Tenant ID required'], 400);
        }

        $notification = CrmNotification::where('tenant_id', $tenantId)->findOrFail($id);
        $notification->archived = true;
        $notification->save();

        return response()->json(['data' => $notification]);
    }

    /**
     * Delete notification.
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        if (!$tenantId) {
            return response()->json(['error' => 'Tenant ID required'], 400);
        }

        $notification = CrmNotification::where('tenant_id', $tenantId)->findOrFail($id);
        $notification->delete();

        return response()->json(null, 204);
    }
}
