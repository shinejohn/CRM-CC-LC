<?php

namespace App\Http\Controllers\Api;

use App\Contracts\Alert\AlertServiceInterface;
use App\Http\Controllers\Controller;
use App\Models\Alert\Alert;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AlertController extends Controller
{
    public function __construct(
        private AlertServiceInterface $alertService
    ) {}

    /**
     * List alerts
     */
    public function index(Request $request): JsonResponse
    {
        $query = Alert::query()->with(['creator', 'approver', 'sponsor', 'sponsorship']);
        
        // Filters
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        
        if ($request->has('category')) {
            $query->where('category', $request->category);
        }
        
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('headline', 'ilike', "%{$search}%")
                  ->orWhere('summary', 'ilike', "%{$search}%");
            });
        }
        
        $alerts = $query->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 20));
        
        return response()->json($alerts);
    }

    /**
     * Create alert
     */
    public function create(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'headline' => 'required|string|max:255',
            'summary' => 'required|string',
            'full_content' => 'nullable|string',
            'category' => 'required|string|exists:alert_categories,slug',
            'severity' => 'nullable|string|in:critical,urgent,standard',
            'source_url' => 'nullable|url|max:500',
            'source_name' => 'nullable|string|max:100',
            'image_url' => 'nullable|url|max:500',
            'target_type' => 'required|string|in:all,communities,geo',
            'target_community_ids' => 'nullable|array',
            'target_community_ids.*' => 'exists:communities,id',
            'target_geo_json' => 'nullable|json',
            'target_radius_miles' => 'nullable|integer|min:1',
            'send_email' => 'nullable|boolean',
            'send_sms' => 'nullable|boolean',
            'send_push' => 'nullable|boolean',
            'scheduled_for' => 'nullable|date|after:now',
            'sponsor_id' => 'nullable|exists:sponsors,id',
            'sponsorship_id' => 'nullable|exists:sponsorships,id',
        ]);
        
        $alert = $this->alertService->create($validated);
        
        return response()->json($alert->load(['creator', 'sponsor', 'sponsorship']), 201);
    }

    /**
     * Get alert
     */
    public function show(int $id): JsonResponse
    {
        $alert = Alert::with(['creator', 'approver', 'sponsor', 'sponsorship', 'sends'])
            ->findOrFail($id);
        
        return response()->json($alert);
    }

    /**
     * Update alert
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $alert = Alert::findOrFail($id);
        
        if (!in_array($alert->status, ['draft', 'pending_approval'])) {
            return response()->json(['error' => 'Alert cannot be updated in current status'], 400);
        }
        
        $validated = $request->validate([
            'headline' => 'sometimes|string|max:255',
            'summary' => 'sometimes|string',
            'full_content' => 'nullable|string',
            'category' => 'sometimes|string|exists:alert_categories,slug',
            'severity' => 'nullable|string|in:critical,urgent,standard',
            'source_url' => 'nullable|url|max:500',
            'source_name' => 'nullable|string|max:100',
            'image_url' => 'nullable|url|max:500',
            'target_type' => 'sometimes|string|in:all,communities,geo',
            'target_community_ids' => 'nullable|array',
            'target_community_ids.*' => 'exists:communities,id',
            'target_geo_json' => 'nullable|json',
            'target_radius_miles' => 'nullable|integer|min:1',
            'send_email' => 'nullable|boolean',
            'send_sms' => 'nullable|boolean',
            'send_push' => 'nullable|boolean',
            'scheduled_for' => 'nullable|date|after:now',
            'sponsor_id' => 'nullable|exists:sponsors,id',
            'sponsorship_id' => 'nullable|exists:sponsorships,id',
        ]);
        
        $alert->update($validated);
        
        return response()->json($alert->fresh()->load(['creator', 'sponsor', 'sponsorship']));
    }

    /**
     * Delete alert
     */
    public function destroy(int $id): JsonResponse
    {
        $alert = Alert::findOrFail($id);
        
        if (!in_array($alert->status, ['draft', 'cancelled'])) {
            return response()->json(['error' => 'Alert cannot be deleted in current status'], 400);
        }
        
        $alert->delete();
        
        return response()->json(['message' => 'Alert deleted']);
    }

    /**
     * Submit for approval
     */
    public function submitForApproval(int $id): JsonResponse
    {
        $alert = $this->alertService->submitForApproval($id);
        
        return response()->json($alert);
    }

    /**
     * Approve alert
     */
    public function approve(Request $request, int $id): JsonResponse
    {
        $alert = $this->alertService->approve($id, auth()->id());
        
        return response()->json($alert);
    }

    /**
     * Send alert
     */
    public function send(int $id): JsonResponse
    {
        $results = $this->alertService->send($id);
        
        return response()->json([
            'message' => 'Alert sent',
            'results' => $results,
        ]);
    }

    /**
     * Cancel alert
     */
    public function cancel(int $id): JsonResponse
    {
        $this->alertService->cancel($id);
        
        return response()->json(['message' => 'Alert cancelled']);
    }

    /**
     * Estimate recipients
     */
    public function estimateRecipients(int $id): JsonResponse
    {
        $count = $this->alertService->estimateRecipients($id);
        
        return response()->json(['estimated_recipients' => $count]);
    }

    /**
     * Get alert stats
     */
    public function stats(int $id): JsonResponse
    {
        $alert = Alert::findOrFail($id);
        
        return response()->json([
            'alert_id' => $alert->id,
            'total_recipients' => $alert->total_recipients,
            'email' => [
                'sent' => $alert->email_sent,
                'delivered' => $alert->email_delivered,
                'opened' => $alert->email_opened,
                'open_rate' => $alert->email_open_rate,
            ],
            'sms' => [
                'sent' => $alert->sms_sent,
                'delivered' => $alert->sms_delivered,
            ],
            'push' => [
                'sent' => $alert->push_sent,
                'delivered' => $alert->push_delivered,
            ],
            'clicks' => $alert->total_clicks,
            'ctr' => $alert->ctr,
        ]);
    }
}



