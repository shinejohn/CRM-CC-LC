<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Newsletter\NewsletterSchedule;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class NewsletterScheduleController extends Controller
{
    /**
     * List schedules
     */
    public function index(Request $request): JsonResponse
    {
        $schedules = NewsletterSchedule::with(['community', 'dailyTemplate', 'weeklyTemplate'])
            ->paginate($request->get('per_page', 20));

        return response()->json($schedules);
    }

    /**
     * Update schedule
     */
    public function update(Request $request, int $communityId): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'daily_enabled' => 'nullable|boolean',
            'daily_send_time' => 'nullable|date_format:H:i:s',
            'daily_template_id' => 'nullable|exists:newsletter_templates,id',
            'weekly_enabled' => 'nullable|boolean',
            'weekly_send_day' => 'nullable|integer|min:0|max:6',
            'weekly_send_time' => 'nullable|date_format:H:i:s',
            'weekly_template_id' => 'nullable|exists:newsletter_templates,id',
            'timezone' => 'nullable|string|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $schedule = NewsletterSchedule::where('community_id', $communityId)->first();

        if (!$schedule) {
            $schedule = NewsletterSchedule::create([
                'community_id' => $communityId,
                ...$validator->validated(),
            ]);
        } else {
            $schedule->update($validator->validated());
        }

        return response()->json([
            'message' => 'Schedule updated successfully.',
            'schedule' => $schedule->load(['community', 'dailyTemplate', 'weeklyTemplate']),
        ]);
    }
}



