<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreOutboundCampaignRequest;
use App\Models\Customer;
use App\Models\OutboundCampaign;
use App\Models\CampaignRecipient;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OutboundCampaignController extends Controller
{
    /**
     * List all outbound campaigns
     */
    public function index(Request $request): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        if (!$tenantId) {
            return response()->json(['error' => 'Tenant ID required'], 400);
        }

        $query = OutboundCampaign::where('tenant_id', $tenantId);

        // Filter by type
        if ($request->has('type')) {
            $query->where('type', $request->input('type'));
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->input('status'));
        }

        $perPage = $request->input('per_page', 20);
        $campaigns = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json([
            'data' => $campaigns->items(),
            'meta' => [
                'current_page' => $campaigns->currentPage(),
                'last_page' => $campaigns->lastPage(),
                'per_page' => $campaigns->perPage(),
                'total' => $campaigns->total(),
            ],
        ]);
    }

    /**
     * Get campaign details
     */
    public function show(Request $request, string $id): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        $campaign = OutboundCampaign::where('tenant_id', $tenantId)
            ->with('recipients.customer')
            ->findOrFail($id);

        return response()->json(['data' => $campaign]);
    }

    /**
     * Create new campaign
     */
    public function store(StoreOutboundCampaignRequest $request): JsonResponse
    {
        $tenantId = $request->getTenantId();
        
        if (!$tenantId) {
            return response()->json(['error' => 'Tenant ID required'], 400);
        }

        $validated = $request->validated();

        $campaign = OutboundCampaign::create([
            'tenant_id' => $tenantId,
            'name' => $validated['name'],
            'type' => $validated['type'],
            'status' => $validated['scheduled_at'] ?? false ? 'scheduled' : 'draft',
            'subject' => $validated['subject'] ?? null,
            'message' => $validated['message'],
            'template_id' => $validated['template_id'] ?? null,
            'template_variables' => $validated['template_variables'] ?? [],
            'scheduled_at' => $validated['scheduled_at'] ?? null,
            'recipient_segments' => $validated['recipient_segments'] ?? [],
        ]);

        return response()->json([
            'data' => $campaign,
            'message' => 'Campaign created successfully',
        ], 201);
    }

    /**
     * Update campaign
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        $campaign = OutboundCampaign::where('tenant_id', $tenantId)->findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'message' => 'sometimes|string',
            'subject' => 'sometimes|string|max:255',
            'template_id' => 'nullable|uuid',
            'template_variables' => 'nullable|array',
            'scheduled_at' => 'nullable|date',
            'status' => 'sometimes|in:draft,scheduled,running,paused,completed,cancelled',
            'recipient_segments' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $campaign->update($request->only([
            'name', 'message', 'subject', 'template_id', 'template_variables',
            'scheduled_at', 'status', 'recipient_segments',
        ]));

        return response()->json([
            'data' => $campaign,
            'message' => 'Campaign updated successfully',
        ]);
    }

    /**
     * Delete campaign
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        $campaign = OutboundCampaign::where('tenant_id', $tenantId)->findOrFail($id);

        $campaign->delete();

        return response()->json(['message' => 'Campaign deleted successfully']);
    }

    /**
     * Get campaign recipients based on segments
     */
    public function getRecipients(Request $request, string $id): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        $campaign = OutboundCampaign::where('tenant_id', $tenantId)->findOrFail($id);

        $recipients = $this->buildRecipientList($tenantId, $campaign->type, $campaign->recipient_segments ?? []);

        return response()->json([
            'data' => [
                'total' => count($recipients),
                'recipients' => $recipients,
            ],
        ]);
    }

    /**
     * Build recipient list based on segmentation criteria
     */
    private function buildRecipientList(string $tenantId, string $type, array $segments): array
    {
        $query = Customer::where('tenant_id', $tenantId);

        // Apply segmentation filters
        if (isset($segments['industry_category'])) {
            $query->where('industry_category', $segments['industry_category']);
        }

        if (isset($segments['industry_subcategory'])) {
            $query->where('industry_subcategory', $segments['industry_subcategory']);
        }

        if (isset($segments['lead_score_min'])) {
            $query->where('lead_score', '>=', $segments['lead_score_min']);
        }

        if (isset($segments['lead_score_max'])) {
            $query->where('lead_score', '<=', $segments['lead_score_max']);
        }

        if (isset($segments['tags']) && is_array($segments['tags'])) {
            foreach ($segments['tags'] as $tag) {
                $query->whereJsonContains('tags', $tag);
            }
        }

        if (isset($segments['has_email']) && $segments['has_email']) {
            $query->whereNotNull('email')->where('email', '!=', '');
        }

        if (isset($segments['has_phone']) && $segments['has_phone']) {
            $query->whereNotNull('phone')->where('phone', '!=', '');
        }

        $customers = $query->get();

        $recipients = [];
        foreach ($customers as $customer) {
            $recipient = [
                'customer_id' => $customer->id,
                'name' => $customer->owner_name ?? $customer->business_name,
            ];

            if ($type === 'email' && $customer->email) {
                $recipient['email'] = $customer->email;
                $recipients[] = $recipient;
            } elseif (in_array($type, ['phone', 'sms']) && $customer->phone) {
                $recipient['phone'] = $customer->phone;
                $recipients[] = $recipient;
            }
        }

        return $recipients;
    }

    /**
     * Start campaign (queue all recipients)
     */
    public function start(Request $request, string $id): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        $campaign = OutboundCampaign::where('tenant_id', $tenantId)->findOrFail($id);

        if ($campaign->status !== 'draft' && $campaign->status !== 'scheduled') {
            return response()->json([
                'error' => 'Campaign can only be started from draft or scheduled status',
            ], 400);
        }

        DB::transaction(function () use ($campaign, $tenantId) {
            // Get recipients
            $recipients = $this->buildRecipientList($tenantId, $campaign->type, $campaign->recipient_segments ?? []);

            // Create recipient records
            foreach ($recipients as $recipientData) {
                CampaignRecipient::create([
                    'campaign_id' => $campaign->id,
                    'customer_id' => $recipientData['customer_id'] ?? null,
                    'tenant_id' => $tenantId,
                    'email' => $recipientData['email'] ?? null,
                    'phone' => $recipientData['phone'] ?? null,
                    'name' => $recipientData['name'] ?? null,
                    'status' => 'pending',
                ]);
            }

            // Update campaign
            $campaign->update([
                'status' => 'running',
                'total_recipients' => count($recipients),
                'started_at' => now(),
            ]);

            // Queue jobs for sending
            $recipients = CampaignRecipient::where('campaign_id', $campaign->id)
                ->where('status', 'pending')
                ->get();

            foreach ($recipients as $recipient) {
                match ($campaign->type) {
                    'email' => \App\Jobs\SendEmailCampaign::dispatch($recipient, $campaign),
                    'phone' => \App\Jobs\MakePhoneCall::dispatch($recipient, $campaign),
                    'sms' => \App\Jobs\SendSMS::dispatch($recipient, $campaign),
                };
            }
        });

        return response()->json([
            'data' => $campaign->fresh(),
            'message' => 'Campaign started successfully',
        ]);
    }

    /**
     * Get campaign analytics
     */
    public function analytics(Request $request, string $id): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        $campaign = OutboundCampaign::where('tenant_id', $tenantId)->findOrFail($id);

        $campaign->load('recipients');

        $recipients = $campaign->recipients;

        $statusCounts = $recipients->countBy('status')->toArray();

        return response()->json([
            'data' => [
                'campaign_id' => $campaign->id,
                'total_recipients' => $campaign->total_recipients,
                'sent_count' => $campaign->sent_count,
                'delivered_count' => $campaign->delivered_count,
                'failed_count' => $campaign->failed_count,
                'opened_count' => $campaign->opened_count,
                'clicked_count' => $campaign->clicked_count,
                'replied_count' => $campaign->replied_count,
                'answered_count' => $campaign->answered_count,
                'voicemail_count' => $campaign->voicemail_count,
                'delivery_rate' => $campaign->delivery_rate,
                'open_rate' => $campaign->open_rate,
                'click_rate' => $campaign->click_rate,
                'status_breakdown' => $statusCounts,
            ],
        ]);
    }
}
