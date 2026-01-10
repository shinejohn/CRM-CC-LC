<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SmsTemplate;
use App\Models\OutboundCampaign;
use App\Models\CampaignRecipient;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class SMSCampaignController extends Controller
{
    /**
     * List SMS campaigns
     */
    public function index(Request $request): JsonResponse
    {
        return app(OutboundCampaignController::class)->index($request->merge(['type' => 'sms']));
    }

    /**
     * Create SMS campaign
     */
    public function store(Request $request): JsonResponse
    {
        $request->merge(['type' => 'sms']);
        return app(OutboundCampaignController::class)->store($request);
    }

    /**
     * Get SMS templates
     */
    public function templates(Request $request): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        if (!$tenantId) {
            return response()->json(['error' => 'Tenant ID required'], 400);
        }

        $templates = SmsTemplate::where('tenant_id', $tenantId)
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        return response()->json(['data' => $templates]);
    }

    /**
     * Create SMS template
     */
    public function createTemplate(Request $request): JsonResponse
    {
        $validator = \Illuminate\Support\Facades\Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'message' => 'required|string|max:1600', // SMS limit
            'variables' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        $template = SmsTemplate::create([
            'tenant_id' => $tenantId,
            'name' => $request->input('name'),
            'slug' => \Illuminate\Support\Str::slug($request->input('name')) . '-' . \Illuminate\Support\Str::random(6),
            'message' => $request->input('message'),
            'variables' => $request->input('variables', []),
        ]);

        return response()->json([
            'data' => $template,
            'message' => 'Template created successfully',
        ], 201);
    }

    /**
     * Handle Twilio SMS status webhook
     */
    public function smsStatus(Request $request, string $campaignId): JsonResponse
    {
        $messageSid = $request->input('MessageSid');
        $messageStatus = $request->input('MessageStatus');

        $recipient = CampaignRecipient::where('campaign_id', $campaignId)
            ->where('external_id', $messageSid)
            ->first();

        if ($recipient) {
            $statusMap = [
                'queued' => 'queued',
                'sent' => 'sent',
                'delivered' => 'delivered',
                'failed' => 'failed',
                'undelivered' => 'failed',
            ];

            $newStatus = $statusMap[$messageStatus] ?? $recipient->status;

            $recipient->update([
                'status' => $newStatus,
                'delivered_at' => $messageStatus === 'delivered' ? now() : null,
            ]);

            // Update campaign counts
            $campaign = $recipient->campaign;
            if ($messageStatus === 'delivered') {
                $campaign->increment('delivered_count');
            }
        }

        return response()->json(['status' => 'ok']);
    }
}
