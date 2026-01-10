<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
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
        // Load from public/campaigns directory or database
        $campaignsPath = public_path('campaigns');
        
        if (!is_dir($campaignsPath)) {
            return response()->json([
                'data' => [],
                'message' => 'No campaigns found'
            ]);
        }
        
        $campaigns = [];
        $files = glob($campaignsPath . '/campaign_*.json');
        
        foreach ($files as $file) {
            $content = json_decode(file_get_contents($file), true);
            if ($content) {
                $campaigns[] = [
                    'slug' => $content['slug'] ?? basename($file, '.json'),
                    'title' => $content['title'] ?? null,
                    'type' => $content['type'] ?? null,
                ];
            }
        }
        
        return response()->json([
            'data' => $campaigns,
            'count' => count($campaigns),
        ]);
    }
    
    /**
     * Get campaign by slug
     */
    public function show(string $slug): JsonResponse
    {
        // Try to find campaign file
        $campaignFile = public_path("campaigns/campaign_{$slug}.json");
        
        if (!file_exists($campaignFile)) {
            // Try alternative naming
            $campaignFile = public_path("campaigns/{$slug}.json");
        }
        
        if (!file_exists($campaignFile)) {
            // Try loading from master JSON
            $masterFile = public_path('campaigns/landing_pages_master.json');
            if (file_exists($masterFile)) {
                $masterData = json_decode(file_get_contents($masterFile), true);
                if ($masterData && isset($masterData['landing_pages'])) {
                    foreach ($masterData['landing_pages'] as $page) {
                        if (($page['landing_page_slug'] ?? null) === $slug) {
                            return response()->json([
                                'data' => $this->formatCampaignData($page),
                            ]);
                        }
                    }
                }
            }
            
            return response()->json([
                'error' => 'Campaign not found'
            ], 404);
        }
        
        $campaign = json_decode(file_get_contents($campaignFile), true);
        
        if (!$campaign) {
            return response()->json([
                'error' => 'Invalid campaign file'
            ], 500);
        }
        
        return response()->json([
            'data' => $this->formatCampaignData($campaign),
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
    protected function formatCampaignData(array $data): array
    {
        return [
            'slug' => $data['landing_page_slug'] ?? $data['slug'] ?? null,
            'campaign_id' => $data['campaign_id'] ?? null,
            'title' => $data['title'] ?? $data['template_name'] ?? null,
            'type' => $data['type'] ?? $data['campaign_type'] ?? null,
            'landing_page' => $data['landing_page'] ?? $data,
            'presentation' => $data['presentation'] ?? null,
            'ai_persona' => $data['ai_persona'] ?? null,
            'slide_count' => $data['slide_count'] ?? null,
            'duration_seconds' => $data['duration_seconds'] ?? null,
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
