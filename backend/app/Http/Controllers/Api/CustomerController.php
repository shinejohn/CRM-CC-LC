<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCustomerRequest;
use App\Http\Requests\UpdateCustomerRequest;
use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class CustomerController extends Controller
{
    /**
     * List all customers for the tenant
     */
    public function index(Request $request): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        if (!$tenantId) {
            return response()->json(['error' => 'Tenant ID required'], 400);
        }
        
        $query = Customer::where('tenant_id', $tenantId);
        
        // Apply filters
        if ($request->has('industry_category')) {
            $query->where('industry_category', $request->input('industry_category'));
        }
        
        if ($request->has('lead_score_min')) {
            $query->where('lead_score', '>=', $request->input('lead_score_min'));
        }
        
        if ($request->has('engagement_tier')) {
            $query->where('engagement_tier', $request->input('engagement_tier'));
        }
        
        if ($request->has('campaign_status')) {
            $query->where('campaign_status', $request->input('campaign_status'));
        }
        
        if ($request->has('service_model')) {
            $query->where('service_model', $request->input('service_model'));
        }
        
        if ($request->has('community_id')) {
            $query->where('community_id', $request->input('community_id'));
        }

        // tier maps to pipeline_stage (Publishing Platform API: lead, prospect, customer, advocate, churned)
        if ($request->has('tier')) {
            $tier = $request->input('tier');
            $pipelineMap = [
                'lead' => 'hook',
                'prospect' => 'engagement',
                'customer' => 'sales',
                'advocate' => 'retention',
                'churned' => 'churned',
            ];
            if (isset($pipelineMap[$tier])) {
                $query->where('pipeline_stage', $pipelineMap[$tier]);
            }
        }

        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function($q) use ($search) {
                $q->where('business_name', 'ilike', "%{$search}%")
                  ->orWhere('email', 'ilike', "%{$search}%")
                  ->orWhere('owner_name', 'ilike', "%{$search}%");
            });
        }
        
        // Pagination
        $perPage = $request->input('per_page', 20);
        $customers = $query->orderBy('created_at', 'desc')->paginate($perPage);
        
        return response()->json([
            'data' => $customers->items(),
            'meta' => [
                'current_page' => $customers->currentPage(),
                'last_page' => $customers->lastPage(),
                'per_page' => $customers->perPage(),
                'total' => $customers->total(),
            ],
        ]);
    }
    
    /**
     * Get a specific customer
     */
    public function show(Request $request, string $id): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        $customer = Customer::where('tenant_id', $tenantId)
            ->with(['conversations', 'pendingQuestions', 'faqs'])
            ->findOrFail($id);
        
        return response()->json(['data' => $customer]);
    }
    
    /**
     * Get customer by slug
     */
    public function showBySlug(Request $request, string $slug): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        $customer = Customer::where('tenant_id', $tenantId)
            ->where('slug', $slug)
            ->with(['conversations', 'pendingQuestions', 'faqs'])
            ->firstOrFail();
        
        return response()->json(['data' => $customer]);
    }
    
    /**
     * Create a new customer
     */
    public function store(StoreCustomerRequest $request): JsonResponse
    {
        $tenantId = $request->getTenantId();
        
        if (!$tenantId) {
            return response()->json(['error' => 'Tenant ID required'], 400);
        }
        
        $validated = $request->validated();
        $validated['tenant_id'] = $tenantId;

        // Support 'name' as alias for business_name (Publishing Platform API contract)
        if (!empty($validated['name']) && empty($validated['business_name'])) {
            $validated['business_name'] = $validated['name'];
        }
        unset($validated['name']);

        // Generate slug if not provided
        if (empty($validated['slug'])) {
            $baseSlug = Str::slug($validated['business_name'] ?? '');
            $slug = $baseSlug;
            $counter = 1;
            while (Customer::where('slug', $slug)->exists()) {
                $slug = $baseSlug . '-' . $counter;
                $counter++;
            }
            $validated['slug'] = $slug;
        }
        
        $customer = Customer::create($validated);
        
        return response()->json([
            'data' => $customer,
            'message' => 'Customer created successfully'
        ], 201);
    }
    
    /**
     * Update a customer
     */
    public function update(UpdateCustomerRequest $request, string $id): JsonResponse
    {
        $tenantId = $request->getTenantId();
        
        $customer = Customer::where('tenant_id', $tenantId)->findOrFail($id);

        $validated = $request->validated();
        if (!empty($validated['name'])) {
            $validated['business_name'] = $validated['name'];
        }
        unset($validated['name']);

        $customer->update($validated);
        
        return response()->json([
            'data' => $customer->fresh(),
            'message' => 'Customer updated successfully'
        ]);
    }
    
    /**
     * Delete a customer
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        $customer = Customer::where('tenant_id', $tenantId)->findOrFail($id);
        $customer->delete();
        
        return response()->json([
            'message' => 'Customer deleted successfully'
        ]);
    }
    
    /**
     * Update customer business context (AI-first CRM)
     */
    public function updateBusinessContext(Request $request, string $id): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        $customer = Customer::where('tenant_id', $tenantId)->findOrFail($id);
        
        $validated = $request->validate([
            'industry_category' => 'nullable|string',
            'industry_subcategory' => 'nullable|string',
            'business_description' => 'nullable|string',
            'unique_selling_points' => 'nullable|array',
            'products_services' => 'nullable|array',
            'target_audience' => 'nullable|array',
            'business_hours' => 'nullable|array',
            'service_area' => 'nullable|string',
            'brand_voice' => 'nullable|array',
            'content_preferences' => 'nullable|array',
            'contact_preferences' => 'nullable|array',
        ]);
        
        $customer->update($validated);
        
        return response()->json([
            'data' => $customer->fresh(),
            'message' => 'Business context updated successfully'
        ]);
    }
    
    /**
     * Get customer context for AI (helper endpoint)
     */
    public function getAiContext(Request $request, string $id): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        $customer = Customer::where('tenant_id', $tenantId)->findOrFail($id);
        
        // Return structured context for AI
        $context = [
            'customer_id' => $customer->id,
            'business_name' => $customer->business_name,
            'owner_name' => $customer->owner_name,
            'industry' => [
                'category' => $customer->industry_category,
                'subcategory' => $customer->industry_subcategory,
                'id' => $customer->industry_id,
            ],
            'business_description' => $customer->business_description,
            'unique_selling_points' => $customer->unique_selling_points,
            'products_services' => $customer->products_services,
            'target_audience' => $customer->target_audience,
            'brand_voice' => $customer->brand_voice,
            'content_preferences' => $customer->content_preferences,
            'contact_preferences' => $customer->contact_preferences,
            'location' => [
                'city' => $customer->city,
                'state' => $customer->state,
                'service_area' => $customer->service_area,
            ],
            'contact' => [
                'email' => $customer->email,
                'phone' => $customer->phone,
                'website' => $customer->website,
            ],
            'relationship' => [
                'lead_score' => $customer->lead_score,
                'subscription_tier' => $customer->subscription_tier,
                'onboarded_at' => $customer->onboarded_at,
            ],
        ];
        
        return response()->json(['data' => $context]);
    }
    
    /**
     * Get customer engagement history
     */
    public function engagementHistory(Request $request, string $id): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        $customer = Customer::where('tenant_id', $tenantId)->findOrFail($id);

        // Get engagement timeline
        $timeline = [
            'email_opens' => $customer->last_email_open ? [
                'last' => $customer->last_email_open,
                'count' => 1, // TODO: Query actual count from campaign_sends
            ] : null,
            'email_clicks' => $customer->last_email_click ? [
                'last' => $customer->last_email_click,
                'count' => 1, // TODO: Query actual count from campaign_sends
            ] : null,
            'content_views' => $customer->last_content_view ? [
                'last' => $customer->last_content_view,
                'count' => 0, // TODO: Query from content_views table
            ] : null,
            'approvals' => $customer->last_approval ? [
                'last' => $customer->last_approval,
                'count' => 0, // TODO: Query from approvals table
            ] : null,
            'current_score' => $customer->engagement_score,
            'current_tier' => $customer->engagement_tier,
        ];

        return response()->json(['data' => $timeline]);
    }

    /**
     * Get engagement score history
     */
    public function scoreHistory(Request $request, string $id): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        $customer = Customer::where('tenant_id', $tenantId)->findOrFail($id);

        // TODO: Query engagement_score_history table if exists
        return response()->json([
            'data' => [
                'current_score' => $customer->engagement_score,
                'current_tier' => $customer->engagement_tier,
                'tier_name' => $customer->getTierName(),
            ],
        ]);
    }

    /**
     * Get customer timeline (interactions + conversations as unified activity feed)
     */
    public function timeline(Request $request, string $id): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        $customer = Customer::where('tenant_id', $tenantId)->findOrFail($id);

        $interactions = $customer->interactions()
            ->orderBy('completed_at', 'desc')
            ->orderBy('scheduled_at', 'desc')
            ->orderBy('created_at', 'desc')
            ->limit(50)
            ->get();

        $conversations = $customer->conversations()
            ->orderBy('started_at', 'desc')
            ->limit(20)
            ->get();

        $items = [];

        foreach ($interactions as $i) {
            $ts = $i->completed_at ?? $i->scheduled_at ?? $i->due_at ?? $i->created_at;
            $items[] = [
                'id' => $i->id,
                'type' => $this->mapInteractionTypeToTimeline($i->type),
                'title' => $i->title ?? ucfirst(str_replace('_', ' ', $i->type ?? 'activity')),
                'description' => $i->description ?? $i->notes ?? '',
                'timestamp' => $ts?->toIso8601String() ?? $i->created_at?->toIso8601String(),
            ];
        }

        foreach ($conversations as $c) {
            $ts = $c->started_at ?? $c->created_at;
            $msgCount = is_array($c->messages) ? count($c->messages) : 0;
            $items[] = [
                'id' => $c->id,
                'type' => 'meeting',
                'title' => 'Conversation',
                'description' => "{$msgCount} messages",
                'timestamp' => $ts?->toIso8601String() ?? $c->created_at?->toIso8601String(),
            ];
        }

        usort($items, fn ($a, $b) => strcmp($b['timestamp'] ?? '', $a['timestamp'] ?? ''));

        return response()->json(['data' => array_slice($items, 0, 50)]);
    }

    private function mapInteractionTypeToTimeline(?string $type): string
    {
        $map = [
            'phone_call' => 'phone',
            'email' => 'email',
            'sms' => 'sms',
            'note' => 'note',
            'meeting' => 'meeting',
            'task' => 'note',
        ];
        return $map[$type ?? ''] ?? 'note';
    }

    /**
     * Start campaign
     */
    public function startCampaign(Request $request, string $id): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        $customer = Customer::where('tenant_id', $tenantId)->findOrFail($id);

        $service = app(\App\Services\SMBCampaignService::class);
        $service->startCampaign($customer);

        return response()->json([
            'data' => $customer->fresh(),
            'message' => 'Campaign started successfully',
        ]);
    }

    /**
     * Pause campaign
     */
    public function pauseCampaign(Request $request, string $id): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        $customer = Customer::where('tenant_id', $tenantId)->findOrFail($id);

        $validated = $request->validate([
            'reason' => 'required|string|max:255',
        ]);

        $service = app(\App\Services\SMBCampaignService::class);
        $service->pauseCampaign($customer, $validated['reason']);

        return response()->json([
            'data' => $customer->fresh(),
            'message' => 'Campaign paused successfully',
        ]);
    }

    /**
     * Resume campaign
     */
    public function resumeCampaign(Request $request, string $id): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        $customer = Customer::where('tenant_id', $tenantId)->findOrFail($id);

        $service = app(\App\Services\SMBCampaignService::class);
        $service->resumeCampaign($customer);

        return response()->json([
            'data' => $customer->fresh(),
            'message' => 'Campaign resumed successfully',
        ]);
    }

    /**
     * Get AI recommendations for customer (SMB)
     * GET /v1/customers/{id}/recommendations
     */
    public function recommendations(Request $request, string $id): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        $customer = Customer::where('tenant_id', $tenantId)->findOrFail($id);

        $analytics = app(\App\Services\CrmAdvancedAnalyticsService::class);
        $engagementScore = $analytics->calculateEngagementScore($id, $tenantId);
        $predictive = $analytics->calculatePredictiveLeadScore($id, $tenantId);

        $recommendations = [];

        if ($engagementScore < 30) {
            $recommendations[] = [
                'priority' => 'high',
                'category' => 'engagement',
                'title' => 'Re-engage At-Risk Customer',
                'impact' => 'Improve retention',
                'description' => "{$customer->business_name} has low engagement. Consider a personalized outreach to re-engage.",
                'actions' => ['Launch Re-engagement Campaign', 'Schedule Call'],
            ];
        }

        if (($predictive['predicted_score'] ?? $predictive['current_score'] ?? 0) > 70) {
            $recommendations[] = [
                'priority' => 'opportunity',
                'category' => 'sales',
                'title' => 'High-Intent Lead',
                'impact' => '+$2,400 potential',
                'description' => "{$customer->business_name} shows strong buying signals. Prioritize follow-up.",
                'actions' => ['Schedule Strategy Call', 'Send Proposal'],
            ];
        }

        if ($customer->lead_score && $customer->lead_score >= 60 && !$customer->campaign_status) {
            $recommendations[] = [
                'priority' => 'medium',
                'category' => 'marketing',
                'title' => 'Start Marketing Campaign',
                'impact' => 'Increase visibility',
                'description' => "{$customer->business_name} is ready for campaign activation.",
                'actions' => ['Start Campaign', 'View Options'],
            ];
        }

        if (empty($recommendations)) {
            $recommendations[] = [
                'priority' => 'opportunity',
                'category' => 'general',
                'title' => 'Increase Email Frequency',
                'impact' => '+$800/mo',
                'description' => 'Your engagement metrics suggest room to increase touchpoints.',
                'actions' => ['Schedule Strategy Call', 'Adjust Frequency'],
            ];
        }

        return response()->json(['data' => $recommendations]);
    }
}
