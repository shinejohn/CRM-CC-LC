<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Campaign;
use App\Models\Content;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class CampaignController extends Controller
{
    /**
     * List all campaigns
     */
    public function index(): JsonResponse
    {
        $campaigns = Campaign::query()
            ->with('landingPage')
            ->where('is_active', true)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'data' => $campaigns->map(function ($campaign) {
                $landingPage = $campaign->landingPage;
                $dataCaptureFields = $landingPage?->data_capture_fields ?? [];
                $dataCaptureString = is_array($dataCaptureFields)
                    ? implode(', ', $dataCaptureFields)
                    : (string) $dataCaptureFields;

                return [
                    'campaign_id' => $campaign->id,
                    'landing_page_slug' => $campaign->landing_page_slug ?: $campaign->slug,
                    'url' => $landingPage?->url,
                    'template_id' => $landingPage?->template_id,
                    'template_name' => $landingPage?->template_name ?? $campaign->title,
                    'slide_count' => $landingPage?->slide_count ?? 0,
                    'duration_seconds' => $landingPage?->duration_seconds ?? 0,
                    'primary_cta' => $landingPage?->primary_cta,
                    'secondary_cta' => $landingPage?->secondary_cta,
                    'ai_persona' => $landingPage?->ai_persona,
                    'ai_tone' => $landingPage?->ai_tone,
                    'ai_goal' => $landingPage?->ai_goal,
                    'data_capture_fields' => $dataCaptureString,
                    'audio_base_url' => $landingPage?->audio_base_url,
                    'crm_tracking' => $landingPage?->crm_tracking ?? false,
                    'conversion_goal' => $landingPage?->conversion_goal,
                    'utm_source' => $landingPage?->utm_source,
                    'utm_medium' => $landingPage?->utm_medium,
                    'utm_campaign' => $landingPage?->utm_campaign,
                    'utm_content' => $landingPage?->utm_content,
                ];
            })->values(),
            'count' => $campaigns->count(),
        ]);
    }
    
    /**
     * Get campaign by slug
     */
    public function show(string $slug): JsonResponse
    {
        $campaign = Campaign::with(['landingPage', 'emails', 'content'])
            ->where('slug', $slug)
            ->orWhere('landing_page_slug', $slug)
            ->orWhere('id', $slug)
            ->first();

        if (!$campaign) {
            return response()->json(['error' => 'Campaign not found'], 404);
        }

        $content = $campaign->content->first()
            ?? Content::where('slug', $slug)->first();

        return response()->json([
            'data' => $this->formatCampaignData($campaign, $content),
        ]);
    }
    
    /**
     * Download guide for a campaign
     */
    public function guide(string $id): \Illuminate\Http\Response
    {
        // Look for guide PDF in storage
        $guidePath = "guides/campaign_{$id}_guide.pdf";
        
        // Check if guide exists in storage
        if (Storage::disk('public')->exists($guidePath)) {
            $filePath = Storage::disk('public')->path($guidePath);
            return response()->download($filePath, "guide-{$id}.pdf", [
                'Content-Type' => 'application/pdf',
            ]);
        }
        
        // Check in public directory as fallback
        $publicPath = public_path("guides/campaign_{$id}_guide.pdf");
        if (file_exists($publicPath)) {
            return response()->download($publicPath, "guide-{$id}.pdf", [
                'Content-Type' => 'application/pdf',
            ]);
        }
        
        // If guide doesn't exist, return 404
        return response()->json([
            'error' => 'Guide not found for this campaign'
        ], 404);
    }
    
    /**
     * Format campaign data for API response
     */
    protected function formatCampaignData(Campaign $campaign, ?Content $content): array
    {
        $landingPage = $campaign->landingPage;
        $emails = $campaign->emails
            ->where('is_active', true)
            ->mapWithKeys(function ($email) {
                return [
                    $email->template_key => [
                        'subject' => $email->subject,
                        'preview_text' => $email->preview_text,
                        'body' => $email->body_html,
                        'body_text' => $email->body_text,
                    ],
                ];
            })
            ->toArray();

        $dataCaptureFields = $landingPage?->data_capture_fields ?? [];
        $dataCaptureString = is_array($dataCaptureFields)
            ? implode(', ', $dataCaptureFields)
            : (string) $dataCaptureFields;

        return [
            'campaign' => [
                'id' => $campaign->id,
                'week' => $campaign->week,
                'day' => $campaign->day,
                'type' => $campaign->type,
                'title' => $campaign->title,
                'subject' => $campaign->subject,
                'landing_page' => $campaign->landing_page_slug ?: $campaign->slug,
                'template' => $landingPage?->template_id,
                'description' => $landingPage?->template_name,
            ],
            'landing_page' => [
                'campaign_id' => $campaign->id,
                'landing_page_slug' => $campaign->landing_page_slug ?: $campaign->slug,
                'url' => $landingPage?->url,
                'template_id' => $landingPage?->template_id,
                'template_name' => $landingPage?->template_name,
                'slide_count' => $landingPage?->slide_count ?? ($content ? count($content->slides ?? []) : 0),
                'duration_seconds' => $landingPage?->duration_seconds,
                'primary_cta' => $landingPage?->primary_cta,
                'secondary_cta' => $landingPage?->secondary_cta,
                'ai_persona' => $landingPage?->ai_persona,
                'ai_tone' => $landingPage?->ai_tone,
                'ai_goal' => $landingPage?->ai_goal,
                'data_capture_fields' => $dataCaptureString,
                'audio_base_url' => $landingPage?->audio_base_url,
                'crm_tracking' => $landingPage?->crm_tracking ?? false,
                'conversion_goal' => $landingPage?->conversion_goal,
                'utm_source' => $landingPage?->utm_source,
                'utm_medium' => $landingPage?->utm_medium,
                'utm_campaign' => $landingPage?->utm_campaign,
                'utm_content' => $landingPage?->utm_content,
            ],
            'template' => $landingPage?->metadata['template'] ?? null,
            'slides' => $content?->slides ?? [],
            'article' => $content?->article_body
                ? [
                    'title' => $content->title,
                    'content' => $content->article_body,
                ]
                : null,
            'emails' => $emails,
            'personalization' => $landingPage?->metadata['personalization'] ?? null,
            'presentation' => null,
        ];
    }
    
    /**
     * Handle contact sales form submission
     */
    public function contactSales(Request $request): JsonResponse
    {
        $validator = \Illuminate\Support\Facades\Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'company' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'message' => 'required|string|max:5000',
            'campaign_id' => 'nullable|string',
            'campaign_slug' => 'nullable|string',
            'utm_source' => 'nullable|string',
            'utm_medium' => 'nullable|string',
            'utm_campaign' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $data = $validator->validated();
            
            // Get tenant ID from request
            $tenantId = $request->header('X-Tenant-ID') ?? 'default';
            
            // TODO: Send email notification to sales team
            // This would typically use Laravel Mail or a service like SendGrid
            // For now, we'll log it and return success
            
            \Log::info('Contact Sales Form Submission', [
                'tenant_id' => $tenantId,
                'name' => $data['name'],
                'email' => $data['email'],
                'company' => $data['company'] ?? null,
                'phone' => $data['phone'] ?? null,
                'campaign_id' => $data['campaign_id'] ?? null,
                'campaign_slug' => $data['campaign_slug'] ?? null,
                'utm_source' => $data['utm_source'] ?? null,
                'utm_medium' => $data['utm_medium'] ?? null,
                'utm_campaign' => $data['utm_campaign'] ?? null,
            ]);
            
            // TODO: Store in database (optional)
            // Could create a ContactInquiry model and store submissions
            
            return response()->json([
                'success' => true,
                'message' => 'Thank you for contacting us! Our sales team will reach out to you shortly.',
            ], 200);
        } catch (\Exception $e) {
            \Log::error('Contact Sales Form Error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            
            return response()->json([
                'error' => 'Failed to submit contact form',
                'message' => 'An error occurred while processing your request. Please try again later.',
            ], 500);
        }
    }
}
