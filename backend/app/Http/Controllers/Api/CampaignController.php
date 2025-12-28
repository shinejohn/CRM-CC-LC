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
}
