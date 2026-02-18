<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\GeneratedContent;
use App\Models\ContentTemplate;
use App\Services\ContentGenerationService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class ContentGenerationController extends Controller
{
    protected ContentGenerationService $contentService;

    public function __construct(ContentGenerationService $contentService)
    {
        $this->contentService = $contentService;
    }

    /**
     * List all generated content
     */
    public function index(Request $request): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        if (!$tenantId) {
            return response()->json(['error' => 'Tenant ID required'], 400);
        }

        $query = GeneratedContent::where('tenant_id', $tenantId);

        // Filter by type
        if ($request->has('type')) {
            $query->where('type', $request->input('type'));
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
        $content = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json([
            'data' => $content->items(),
            'meta' => [
                'current_page' => $content->currentPage(),
                'last_page' => $content->lastPage(),
                'per_page' => $content->perPage(),
                'total' => $content->total(),
            ],
        ]);
    }

    /**
     * Get content details
     */
    public function show(Request $request, string $id): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        $content = GeneratedContent::where('tenant_id', $tenantId)
            ->with(['versions', 'workflowHistory', 'template'])
            ->findOrFail($id);

        return response()->json(['data' => $content]);
    }

    /**
     * Generate content from campaign
     */
    public function generateFromCampaign(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'campaign_id' => 'required|uuid|exists:outbound_campaigns,id',
            'type' => 'required|in:article,blog,social,email,landing_page',
            'template_id' => 'nullable|uuid|exists:content_templates,id',
            'parameters' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $content = $this->contentService->generateFromCampaign(
                $request->input('campaign_id'),
                $request->input('type'),
                $request->input('template_id'),
                $request->input('parameters', [])
            );

            return response()->json([
                'data' => $content,
                'message' => 'Content generated successfully',
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to generate content',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Generate content from scratch
     */
    public function generate(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'type' => 'required|in:article,blog,social,email,landing_page',
            'template_id' => 'nullable|uuid|exists:content_templates,id',
            'parameters' => 'required|array',
            'parameters.title' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        if (!$tenantId) {
            return response()->json(['error' => 'Tenant ID required'], 400);
        }

        try {
            $content = $this->contentService->generate(
                $tenantId,
                $request->input('type'),
                $request->input('parameters'),
                $request->input('template_id')
            );

            return response()->json([
                'data' => $content,
                'message' => 'Content generated successfully',
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to generate content',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update content
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        $content = GeneratedContent::where('tenant_id', $tenantId)->findOrFail($id);

        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|string|max:255',
            'content' => 'sometimes|string',
            'excerpt' => 'nullable|string',
            'metadata' => 'nullable|array',
            'status' => 'sometimes|in:draft,review,approved,published,archived',
            'scheduled_publish_at' => 'nullable|date',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $oldStatus = $content->status;
        
        // Create version if content changed
        if ($request->has('content') || $request->has('title')) {
            $content->createVersion($request->input('change_notes'));
        }

        $content->update($request->only([
            'title', 'content', 'excerpt', 'metadata', 'status',
            'scheduled_publish_at', 'notes',
        ]));

        // Record workflow action if status changed
        if ($request->has('status') && $request->input('status') !== $oldStatus) {
            $content->recordWorkflowAction(
                'status_changed',
                $oldStatus,
                $request->input('status'),
                null, // userId
                $request->input('workflow_notes')
            );
        }

        return response()->json([
            'data' => $content->fresh(),
            'message' => 'Content updated successfully',
        ]);
    }

    /**
     * Update content status (workflow action)
     */
    public function updateStatus(Request $request, string $id): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        $content = GeneratedContent::where('tenant_id', $tenantId)->findOrFail($id);

        $validator = Validator::make($request->all(), [
            'status' => 'required|in:draft,review,approved,published,archived',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $oldStatus = $content->status;
        $newStatus = $request->input('status');

        $content->update(['status' => $newStatus]);

        // Record workflow action
        $actionMap = [
            'review' => 'reviewed',
            'approved' => 'approved',
            'published' => 'published',
            'archived' => 'archived',
        ];

        $action = $actionMap[$newStatus] ?? 'status_changed';
        
        if ($newStatus === 'published') {
            $content->update(['published_at' => now()]);
        }

        $content->recordWorkflowAction(
            $action,
            $oldStatus,
            $newStatus,
            null, // userId
            $request->input('notes')
        );

        return response()->json([
            'data' => $content->fresh(),
            'message' => 'Content status updated successfully',
        ]);
    }

    /**
     * Get content versions (version history)
     */
    public function versions(Request $request, string $id): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');

        $content = GeneratedContent::where('tenant_id', $tenantId)->findOrFail($id);
        $versions = $content->versions()->orderBy('version_number', 'desc')->get();

        return response()->json(['data' => $versions]);
    }

    /**
     * Get content templates
     */
    public function templates(Request $request): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        if (!$tenantId) {
            return response()->json(['error' => 'Tenant ID required'], 400);
        }

        $query = ContentTemplate::where('tenant_id', $tenantId)
            ->where('is_active', true);

        if ($request->has('type')) {
            $query->where('type', $request->input('type'));
        }

        $templates = $query->orderBy('name')->get();

        return response()->json(['data' => $templates]);
    }

    /**
     * Create content template
     */
    public function createTemplate(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'type' => 'required|in:article,blog,social,email,landing_page',
            'prompt_template' => 'required|string',
            'description' => 'nullable|string',
            'variables' => 'nullable|array',
            'structure' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        $template = ContentTemplate::create([
            'tenant_id' => $tenantId,
            'name' => $request->input('name'),
            'slug' => Str::slug($request->input('name')) . '-' . Str::random(6),
            'type' => $request->input('type'),
            'description' => $request->input('description'),
            'prompt_template' => $request->input('prompt_template'),
            'variables' => $request->input('variables', []),
            'structure' => $request->input('structure', []),
        ]);

        return response()->json([
            'data' => $template,
            'message' => 'Template created successfully',
        ], 201);
    }
}
