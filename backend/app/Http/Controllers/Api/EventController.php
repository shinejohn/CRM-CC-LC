<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class EventController extends Controller
{
    /**
     * List events
     */
    public function index(Request $request): JsonResponse
    {
        $query = Event::query();

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('event_type')) {
            $query->where('event_type', $request->event_type);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'ILIKE', "%{$search}%")
                    ->orWhere('description', 'ILIKE', "%{$search}%")
                    ->orWhere('location', 'ILIKE', "%{$search}%");
            });
        }

        if ($request->has('from_date')) {
            $query->where('start_at', '>=', $request->from_date);
        }

        if ($request->has('to_date')) {
            $query->where('start_at', '<=', $request->to_date);
        }

        $perPage = $request->get('per_page', 20);
        $events = $query->orderBy('start_at', 'desc')->paginate($perPage);

        return response()->json([
            'data' => $events->items(),
            'meta' => [
                'current_page' => $events->currentPage(),
                'last_page' => $events->lastPage(),
                'per_page' => $events->perPage(),
                'total' => $events->total(),
            ],
        ]);
    }

    /**
     * Create event
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'location' => 'nullable|string|max:255',
            'event_type' => 'nullable|string|max:100',
            'start_at' => 'required|date',
            'end_at' => 'nullable|date|after_or_equal:start_at',
            'status' => 'nullable|in:draft,scheduled,published,cancelled',
            'max_attendees' => 'nullable|integer|min:0',
            'is_ticketed' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $event = Event::create([
            'tenant_id' => $request->input('tenant_id'),
            'title' => $request->title,
            'slug' => Str::slug($request->title),
            'description' => $request->description,
            'location' => $request->location,
            'event_type' => $request->event_type,
            'start_at' => $request->start_at,
            'end_at' => $request->end_at,
            'status' => $request->status ?? 'draft',
            'max_attendees' => $request->max_attendees,
            'is_ticketed' => $request->boolean('is_ticketed', false),
        ]);

        return response()->json([
            'data' => $event,
            'message' => 'Event created successfully',
        ], 201);
    }

    /**
     * Get event
     */
    public function show(string $id): JsonResponse
    {
        $event = Event::findOrFail($id);
        return response()->json(['data' => $event]);
    }

    /**
     * Update event
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $event = Event::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'location' => 'nullable|string|max:255',
            'event_type' => 'nullable|string|max:100',
            'start_at' => 'sometimes|date',
            'end_at' => 'nullable|date',
            'status' => 'nullable|in:draft,scheduled,published,cancelled',
            'max_attendees' => 'nullable|integer|min:0',
            'is_ticketed' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $updateData = $request->only([
            'title', 'description', 'location', 'event_type',
            'start_at', 'end_at', 'status', 'max_attendees', 'is_ticketed',
        ]);

        if (isset($updateData['title'])) {
            $updateData['slug'] = Str::slug($updateData['title']);
        }

        $event->update($updateData);

        return response()->json([
            'data' => $event->fresh(),
            'message' => 'Event updated successfully',
        ]);
    }

    /**
     * Delete event
     */
    public function destroy(string $id): JsonResponse
    {
        $event = Event::findOrFail($id);
        $event->delete();
        return response()->json(['message' => 'Event deleted successfully']);
    }
}
