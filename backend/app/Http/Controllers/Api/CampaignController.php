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
        $campaignFile = public_path("campaigns/campaign_{$slug}.json");
        
        if (!file_exists($campaignFile)) {
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
            'data' => $campaign,
        ]);
    }
}
