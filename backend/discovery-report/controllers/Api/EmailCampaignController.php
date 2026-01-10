<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\EmailTemplate;
use App\Models\OutboundCampaign;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class EmailCampaignController extends Controller
{
    /**
     * List email campaigns
     */
    public function index(Request $request): JsonResponse
    {
        return app(OutboundCampaignController::class)->index($request->merge(['type' => 'email']));
    }

    /**
     * Create email campaign
     */
    public function store(Request $request): JsonResponse
    {
        $request->merge(['type' => 'email']);
        return app(OutboundCampaignController::class)->store($request);
    }

    /**
     * Get email templates
     */
    public function templates(Request $request): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        if (!$tenantId) {
            return response()->json(['error' => 'Tenant ID required'], 400);
        }

        $templates = EmailTemplate::where('tenant_id', $tenantId)
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        return response()->json(['data' => $templates]);
    }

    /**
     * Create email template
     */
    public function createTemplate(Request $request): JsonResponse
    {
        $validator = \Illuminate\Support\Facades\Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'subject' => 'required|string|max:255',
            'html_content' => 'required|string',
            'text_content' => 'nullable|string',
            'variables' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');
        
        $template = EmailTemplate::create([
            'tenant_id' => $tenantId,
            'name' => $request->input('name'),
            'slug' => \Illuminate\Support\Str::slug($request->input('name')) . '-' . \Illuminate\Support\Str::random(6),
            'subject' => $request->input('subject'),
            'html_content' => $request->input('html_content'),
            'text_content' => $request->input('text_content'),
            'variables' => $request->input('variables', []),
        ]);

        return response()->json([
            'data' => $template,
            'message' => 'Template created successfully',
        ], 201);
    }
}
