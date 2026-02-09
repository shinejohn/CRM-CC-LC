<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Emergency\MunicipalAdmin;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class MunicipalAdminController extends Controller
{
    /**
     * List municipal admins
     */
    public function index(Request $request): JsonResponse
    {
        $query = MunicipalAdmin::with(['user', 'community'])
            ->orderBy('created_at', 'desc');

        // Filter by community
        if ($request->has('community_id')) {
            $query->where('community_id', $request->community_id);
        }

        // Filter by active status
        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        $admins = $query->paginate($request->get('per_page', 20));

        return response()->json($admins);
    }

    /**
     * Create municipal admin
     */
    public function create(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|exists:users,id',
            'community_id' => 'required|exists:communities,id',
            'title' => 'required|string|max:255',
            'department' => 'nullable|string|max:255',
            'can_send_emergency' => 'boolean',
            'can_send_test' => 'boolean',
            'authorization_pin' => 'required|string|size:6',
            'phone' => 'required|string|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Check if admin already exists for this user/community
        $existing = MunicipalAdmin::where('user_id', $request->user_id)
            ->where('community_id', $request->community_id)
            ->first();

        if ($existing) {
            return response()->json([
                'error' => 'Municipal admin already exists for this user and community.',
            ], 400);
        }

        $admin = MunicipalAdmin::create([
            'user_id' => $request->user_id,
            'community_id' => $request->community_id,
            'title' => $request->title,
            'department' => $request->department,
            'can_send_emergency' => $request->boolean('can_send_emergency', false),
            'can_send_test' => $request->boolean('can_send_test', true),
            'authorization_pin_hash' => Hash::make($request->authorization_pin),
            'phone' => $request->phone,
            'is_active' => false, // Must be verified before activation
        ]);

        return response()->json([
            'message' => 'Municipal admin created successfully. Admin must be verified before activation.',
            'admin' => $admin->load(['user', 'community']),
        ], 201);
    }

    /**
     * Update municipal admin
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $admin = MunicipalAdmin::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|string|max:255',
            'department' => 'nullable|string|max:255',
            'can_send_emergency' => 'boolean',
            'can_send_test' => 'boolean',
            'phone' => 'sometimes|string|max:50',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $admin->update($validator->validated());

        return response()->json([
            'message' => 'Municipal admin updated successfully.',
            'admin' => $admin->fresh()->load(['user', 'community']),
        ]);
    }

    /**
     * Delete municipal admin
     */
    public function destroy(int $id): JsonResponse
    {
        $admin = MunicipalAdmin::findOrFail($id);
        $admin->delete();

        return response()->json([
            'message' => 'Municipal admin deleted successfully.',
        ]);
    }

    /**
     * Verify municipal admin
     */
    public function verify(Request $request, int $id): JsonResponse
    {
        $admin = MunicipalAdmin::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'verified_by' => 'required|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $admin->update([
            'is_active' => true,
            'verified_at' => now(),
            'verified_by' => $request->verified_by,
        ]);

        return response()->json([
            'message' => 'Municipal admin verified and activated successfully.',
            'admin' => $admin->fresh()->load(['user', 'community']),
        ]);
    }
}



