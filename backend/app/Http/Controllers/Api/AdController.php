<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\GeneratedAd;
use App\Models\AdTemplate;
use App\Services\AdGenerationService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class AdController extends Controller
{
    protected AdGenerationService $adService;

    public function __construct(AdGenerationService $adService)
    {
        $this->adService = $adService;
    }

    /**
     * List all generated ads
     */
    public function index(Request $request): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        if (!$tenantId) {
            return response()->json(['error' => 'Tenant ID required'], 400);
        }

        $query = GeneratedAd::where('tenant_id', $tenantId);

        // Filter by platform
        if ($request->has('platform')) {
            $query->where('platform', $request->input('platform'));
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->input('status'));
        }

        // Filter by campaign
        if ($request->has('campaign_id')) {
            $query->where('campaign_id', $request->input('campaign_id'));
        }

        $perPage = $request->input('per_page', 20);
        $ads = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json([
            'data' => $ads->items(),
            'meta' => [
                'current_page' => $ads->currentPage(),
                'last_page' => $ads->lastPage(),
                'per_page' => $ads->perPage(),
                'total' => $ads->total(),
            ],
        ]);
    }

    /**
     * Get ad details
     */
    public function show(Request $request, string $id): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        $ad = GeneratedAd::where('tenant_id', $tenantId)
            ->with(['template', 'content'])
            ->findOrFail($id);

        return response()->json(['data' => $ad]);
    }

    /**
     * Generate ad from campaign
     */
    public function generateFromCampaign(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'campaign_id' => 'required|uuid|exists:outbound_campaigns,id',
            'platform' => 'required|in:facebook,google,instagram,linkedin,twitter,display',
            'ad_type' => 'required|in:image,video,carousel,text,story',
            'template_id' => 'nullable|uuid|exists:ad_templates,id',
            'parameters' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $ad = $this->adService->generateFromCampaign(
                $request->input('campaign_id'),
                $request->input('platform'),
                $request->input('ad_type'),
                $request->input('template_id'),
                $request->input('parameters', [])
            );

            return response()->json([
                'data' => $ad,
                'message' => 'Ad generated successfully',
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to generate ad',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Generate ad from content
     */
    public function generateFromContent(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'content_id' => 'required|uuid|exists:generated_content,id',
            'platform' => 'required|in:facebook,google,instagram,linkedin,twitter,display',
            'ad_type' => 'required|in:image,video,carousel,text,story',
            'template_id' => 'nullable|uuid|exists:ad_templates,id',
            'parameters' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $ad = $this->adService->generateFromContent(
                $request->input('content_id'),
                $request->input('platform'),
                $request->input('ad_type'),
                $request->input('template_id'),
                $request->input('parameters', [])
            );

            return response()->json([
                'data' => $ad,
                'message' => 'Ad generated successfully',
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to generate ad',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update ad
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        $ad = GeneratedAd::where('tenant_id', $tenantId)->findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'headline' => 'nullable|string',
            'description' => 'nullable|string',
            'call_to_action' => 'nullable|string',
            'destination_url' => 'nullable|url',
            'status' => 'sometimes|in:draft,review,approved,scheduled,active,paused,archived',
            'scheduled_start_at' => 'nullable|date',
            'scheduled_end_at' => 'nullable|date',
            'targeting' => 'nullable|array',
            'budget' => 'nullable|array',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $ad->update($request->only([
            'name', 'headline', 'description', 'call_to_action', 'destination_url',
            'status', 'scheduled_start_at', 'scheduled_end_at',
            'targeting', 'budget', 'notes',
        ]));

        return response()->json([
            'data' => $ad->fresh(),
            'message' => 'Ad updated successfully',
        ]);
    }

    /**
     * Get ad templates
     */
    public function templates(Request $request): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        if (!$tenantId) {
            return response()->json(['error' => 'Tenant ID required'], 400);
        }

        $query = AdTemplate::where('tenant_id', $tenantId)
            ->where('is_active', true);

        if ($request->has('platform')) {
            $query->where('platform', $request->input('platform'));
        }

        if ($request->has('ad_type')) {
            $query->where('ad_type', $request->input('ad_type'));
        }

        $templates = $query->orderBy('name')->get();

        return response()->json(['data' => $templates]);
    }

    /**
     * Create ad template
     */
    public function createTemplate(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'platform' => 'required|in:facebook,google,instagram,linkedin,twitter,display',
            'ad_type' => 'required|in:image,video,carousel,text,story',
            'structure' => 'nullable|array',
            'prompt_template' => 'nullable|string',
            'description' => 'nullable|string',
            'variables' => 'nullable|array',
            'specs' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        $template = AdTemplate::create([
            'tenant_id' => $tenantId,
            'name' => $request->input('name'),
            'slug' => Str::slug($request->input('name')) . '-' . Str::random(6),
            'platform' => $request->input('platform'),
            'ad_type' => $request->input('ad_type'),
            'description' => $request->input('description'),
            'structure' => $request->input('structure', []),
            'prompt_template' => $request->input('prompt_template'),
            'variables' => $request->input('variables', []),
            'specs' => $request->input('specs', []),
        ]);

        return response()->json([
            'data' => $template,
            'message' => 'Template created successfully',
        ], 201);
    }
}
