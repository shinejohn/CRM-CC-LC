<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PhoneScript;
use App\Models\OutboundCampaign;
use App\Models\CampaignRecipient;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class PhoneCampaignController extends Controller
{
    /**
     * List phone campaigns
     */
    public function index(Request $request): JsonResponse
    {
        return app(OutboundCampaignController::class)->index($request->merge(['type' => 'phone']));
    }

    /**
     * Create phone campaign
     */
    public function store(Request $request): JsonResponse
    {
        $request->merge(['type' => 'phone']);
        return app(OutboundCampaignController::class)->store($request);
    }

    /**
     * Get phone scripts
     */
    public function scripts(Request $request): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        if (!$tenantId) {
            return response()->json(['error' => 'Tenant ID required'], 400);
        }

        $scripts = PhoneScript::where('tenant_id', $tenantId)
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        return response()->json(['data' => $scripts]);
    }

    /**
     * Create phone script
     */
    public function createScript(Request $request): JsonResponse
    {
        $validator = \Illuminate\Support\Facades\Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'script' => 'required|string',
            'variables' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        $script = PhoneScript::create([
            'tenant_id' => $tenantId,
            'name' => $request->input('name'),
            'slug' => \Illuminate\Support\Str::slug($request->input('name')) . '-' . \Illuminate\Support\Str::random(6),
            'script' => $request->input('script'),
            'variables' => $request->input('variables', []),
        ]);

        return response()->json([
            'data' => $script,
            'message' => 'Script created successfully',
        ], 201);
    }

    /**
     * Handle Twilio call status webhook
     */
    public function callStatus(Request $request, string $campaignId): JsonResponse
    {
        $callSid = $request->input('CallSid');
        $callStatus = $request->input('CallStatus');
        $duration = $request->input('CallDuration');

        $recipient = CampaignRecipient::where('campaign_id', $campaignId)
            ->where('external_id', $callSid)
            ->first();

        if ($recipient) {
            $statusMap = [
                'queued' => 'queued',
                'ringing' => 'sent',
                'in-progress' => 'answered',
                'completed' => 'answered',
                'busy' => 'failed',
                'no-answer' => 'voicemail',
                'failed' => 'failed',
            ];

            $newStatus = $statusMap[$callStatus] ?? $recipient->status;

            $recipient->update([
                'status' => $newStatus,
                'answered_at' => in_array($callStatus, ['in-progress', 'completed']) ? now() : null,
                'duration_seconds' => $duration ? (int) $duration : null,
            ]);

            // Update campaign counts
            $campaign = $recipient->campaign;
            if ($newStatus === 'answered') {
                $campaign->increment('answered_count');
            } elseif ($newStatus === 'voicemail') {
                $campaign->increment('voicemail_count');
            }
        }

        return response()->json(['status' => 'ok']);
    }
}
