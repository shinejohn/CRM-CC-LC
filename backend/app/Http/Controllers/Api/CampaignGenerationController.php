<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\CampaignGenerationService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class CampaignGenerationController extends Controller
{
    public function __construct(
        private CampaignGenerationService $campaignService
    ) {}

    /**
     * Generate a new campaign using AI
     */
    public function generate(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'type' => 'required|in:Educational,Hook,HowTo',
            'objective' => 'nullable|string|max:500',
            'topic' => 'nullable|string|max:200',
            'customer_id' => 'nullable|uuid|exists:customers,id',
            'target_audience' => 'nullable|string|max:200',
            'week' => 'nullable|integer|min:1',
            'day' => 'nullable|integer|min:1',
            'utm_campaign' => 'nullable|string|max:200',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $campaignData = $this->campaignService->generateCampaign($request->all());

            // Save campaign to JSON file
            $campaignId = $campaignData['campaign']['id'];
            $filename = "campaign_{$campaignId}.json";
            $campaignsPath = public_path('campaigns');

            if (!is_dir($campaignsPath)) {
                mkdir($campaignsPath, 0755, true);
            }

            file_put_contents(
                $campaignsPath . '/' . $filename,
                json_encode($campaignData, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES)
            );

            Log::info('Campaign generated', [
                'campaign_id' => $campaignId,
                'type' => $request->input('type'),
            ]);

            return response()->json([
                'data' => $campaignData,
                'message' => 'Campaign generated successfully',
            ]);
        } catch (\Exception $e) {
            Log::error('Campaign generation failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'error' => 'Failed to generate campaign',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get available campaign templates
     */
    public function templates(): JsonResponse
    {
        try {
            $templates = $this->campaignService->getTemplates();

            return response()->json([
                'data' => $templates,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to load templates',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get campaign suggestions based on customer data
     */
    public function suggestions(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'customer_id' => 'required|uuid|exists:customers,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $customerId = $request->input('customer_id');
            $customer = \App\Models\Customer::find($customerId);

            if (!$customer) {
                return response()->json([
                    'error' => 'Customer not found',
                ], 404);
            }

            $suggestions = $this->generateSuggestions($customer);

            return response()->json([
                'data' => $suggestions,
            ]);
        } catch (\Exception $e) {
            Log::error('Campaign suggestions failed', [
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'error' => 'Failed to generate suggestions',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Generate campaign suggestions for a customer
     */
    private function generateSuggestions($customer): array
    {
        $suggestions = [];

        // Analyze customer data to suggest campaigns
        if (!empty($customer->challenges)) {
            $suggestions[] = [
                'type' => 'Educational',
                'title' => 'Address ' . (is_array($customer->challenges) ? $customer->challenges[0] : 'Your Challenges'),
                'reason' => 'Educate on solving key challenges',
                'priority' => 'high',
            ];
        }

        if (!empty($customer->goals)) {
            $suggestions[] = [
                'type' => 'HowTo',
                'title' => 'How to Achieve ' . (is_array($customer->goals) ? $customer->goals[0] : 'Your Goals'),
                'reason' => 'Guide toward achieving goals',
                'priority' => 'medium',
            ];
        }

        // Check if customer has low engagement
        if ($customer->lead_score < 50) {
            $suggestions[] = [
                'type' => 'Hook',
                'title' => 'Special Offer for ' . $customer->business_name,
                'reason' => 'Re-engage with compelling offer',
                'priority' => 'high',
            ];
        }

        // Default suggestions if none generated
        if (empty($suggestions)) {
            $suggestions[] = [
                'type' => 'Educational',
                'title' => 'Industry Best Practices',
                'reason' => 'General educational content',
                'priority' => 'medium',
            ];
        }

        return $suggestions;
    }
}
