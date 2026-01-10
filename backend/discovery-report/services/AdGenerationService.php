<?php

namespace App\Services;

use App\Models\AdTemplate;
use App\Models\GeneratedAd;
use App\Models\OutboundCampaign;
use App\Models\GeneratedContent;
use Illuminate\Support\Facades\Log;

class AdGenerationService
{
    protected OpenRouterService $openRouterService;

    public function __construct(OpenRouterService $openRouterService)
    {
        $this->openRouterService = $openRouterService;
    }

    /**
     * Generate ad from campaign
     */
    public function generateFromCampaign(
        string $campaignId,
        string $platform,
        string $adType,
        ?string $templateId = null,
        array $parameters = []
    ): GeneratedAd {
        // Load campaign data
        $campaign = OutboundCampaign::findOrFail($campaignId);
        
        // Get template
        $template = $templateId 
            ? AdTemplate::find($templateId)
            : AdTemplate::where('platform', $platform)
                ->where('ad_type', $adType)
                ->where('tenant_id', $campaign->tenant_id)
                ->where('is_active', true)
                ->first();

        // Build generation context
        $context = $this->buildContext($campaign, $parameters);
        
        // Build prompt
        $prompt = $template 
            ? $template->renderPrompt($context)
            : $this->buildDefaultPrompt($platform, $adType, $context);

        // Generate ad content via AI
        $messages = [
            ['role' => 'system', 'content' => $this->getSystemPrompt($platform, $adType)],
            ['role' => 'user', 'content' => $prompt],
        ];

        $response = $this->openRouterService->chatCompletion($messages, [
            'temperature' => 0.9,
            'max_tokens' => 2000,
        ]);

        if (!$response) {
            throw new \Exception('Failed to generate ad from AI');
        }

        $aiContent = $response['choices'][0]['message']['content'] ?? '';
        
        // Parse and structure ad content
        $adData = $this->parseAdResponse($aiContent, $platform, $adType, $parameters);

        // Create ad record
        $ad = GeneratedAd::create([
            'tenant_id' => $campaign->tenant_id,
            'name' => $adData['name'] ?? "Ad from {$campaign->name}",
            'platform' => $platform,
            'ad_type' => $adType,
            'status' => 'draft',
            'headline' => $adData['headline'] ?? null,
            'description' => $adData['description'] ?? null,
            'call_to_action' => $adData['call_to_action'] ?? null,
            'destination_url' => $adData['destination_url'] ?? $parameters['destination_url'] ?? null,
            'content' => $adData['content'] ?? [],
            'metadata' => $adData['metadata'] ?? [],
            'campaign_id' => $campaignId,
            'template_id' => $template?->id,
            'generation_params' => $parameters,
        ]);

        return $ad;
    }

    /**
     * Generate ad from content
     */
    public function generateFromContent(
        string $contentId,
        string $platform,
        string $adType,
        ?string $templateId = null,
        array $parameters = []
    ): GeneratedAd {
        // Load content data
        $content = GeneratedContent::findOrFail($contentId);
        
        // Get template
        $template = $templateId 
            ? AdTemplate::find($templateId)
            : AdTemplate::where('platform', $platform)
                ->where('ad_type', $adType)
                ->where('tenant_id', $content->tenant_id)
                ->where('is_active', true)
                ->first();

        // Build generation context
        $context = $this->buildContextFromContent($content, $parameters);
        
        // Build prompt
        $prompt = $template 
            ? $template->renderPrompt($context)
            : $this->buildDefaultPrompt($platform, $adType, $context);

        // Generate ad content via AI
        $messages = [
            ['role' => 'system', 'content' => $this->getSystemPrompt($platform, $adType)],
            ['role' => 'user', 'content' => $prompt],
        ];

        $response = $this->openRouterService->chatCompletion($messages, [
            'temperature' => 0.9,
            'max_tokens' => 2000,
        ]);

        if (!$response) {
            throw new \Exception('Failed to generate ad from AI');
        }

        $aiContent = $response['choices'][0]['message']['content'] ?? '';
        
        // Parse and structure ad content
        $adData = $this->parseAdResponse($aiContent, $platform, $adType, $parameters);

        // Create ad record
        $ad = GeneratedAd::create([
            'tenant_id' => $content->tenant_id,
            'name' => $adData['name'] ?? "Ad from {$content->title}",
            'platform' => $platform,
            'ad_type' => $adType,
            'status' => 'draft',
            'headline' => $adData['headline'] ?? null,
            'description' => $adData['description'] ?? null,
            'call_to_action' => $adData['call_to_action'] ?? null,
            'destination_url' => $adData['destination_url'] ?? $parameters['destination_url'] ?? null,
            'content' => $adData['content'] ?? [],
            'metadata' => $adData['metadata'] ?? [],
            'content_id' => $contentId,
            'template_id' => $template?->id,
            'generation_params' => $parameters,
        ]);

        return $ad;
    }

    /**
     * Build context from campaign
     */
    private function buildContext(OutboundCampaign $campaign, array $parameters): array
    {
        $context = [
            'campaign_name' => $campaign->name,
            'campaign_message' => $campaign->message,
            'campaign_subject' => $campaign->subject ?? '',
        ];

        return array_merge($context, $parameters);
    }

    /**
     * Build context from content
     */
    private function buildContextFromContent(GeneratedContent $content, array $parameters): array
    {
        $context = [
            'content_title' => $content->title,
            'content_excerpt' => $content->excerpt ?? '',
            'content_summary' => mb_substr(strip_tags($content->content), 0, 500),
        ];

        return array_merge($context, $parameters);
    }

    /**
     * Build default prompt
     */
    private function buildDefaultPrompt(string $platform, string $adType, array $context): string
    {
        $prompts = [
            'facebook' => "Create a Facebook ad with headline, description, and call-to-action about {{topic}}. Make it engaging and conversion-focused.",
            'google' => "Create a Google Search ad with headline (30 chars max), description (90 chars max), and call-to-action about {{topic}}. Make it compelling and keyword-rich.",
            'instagram' => "Create an Instagram ad caption (125 chars recommended) with hashtags about {{topic}}. Make it visual and engaging.",
            'linkedin' => "Create a LinkedIn ad with headline, description, and call-to-action about {{topic}}. Make it professional and B2B focused.",
            'twitter' => "Create a Twitter ad (280 chars max) about {{topic}}. Make it concise and impactful.",
        ];

        $template = $prompts[$platform] ?? $prompts['facebook'];

        foreach ($context as $key => $value) {
            $placeholder = "{{{$key}}}";
            $template = str_replace($placeholder, (string) $value, $template);
        }

        return $template;
    }

    /**
     * Get system prompt for platform and ad type
     */
    private function getSystemPrompt(string $platform, string $adType): string
    {
        $prompts = [
            'facebook' => 'You are a Facebook ad copywriter. Create compelling, conversion-focused Facebook ads.',
            'google' => 'You are a Google Ads copywriter. Create keyword-rich, compelling Google Search ads.',
            'instagram' => 'You are an Instagram ad copywriter. Create visual, engaging Instagram ad captions.',
            'linkedin' => 'You are a LinkedIn ad copywriter. Create professional, B2B-focused LinkedIn ads.',
            'twitter' => 'You are a Twitter ad copywriter. Create concise, impactful Twitter ads.',
        ];

        return $prompts[$platform] ?? 'You are a professional ad copywriter. Create compelling ad content.';
    }

    /**
     * Parse AI response into structured ad content
     */
    private function parseAdResponse(string $aiContent, string $platform, string $adType, array $parameters): array
    {
        // Extract headline, description, CTA from structured response
        // For now, use simple parsing - in production, use more sophisticated parsing or structured output
        
        $lines = explode("\n", trim($aiContent));
        
        $headline = null;
        $description = null;
        $callToAction = null;

        foreach ($lines as $line) {
            $line = trim($line);
            if (empty($line)) continue;

            // Try to extract headline
            if (preg_match('/headline[:\-]\s*(.+)/i', $line, $matches)) {
                $headline = trim($matches[1]);
            }
            // Try to extract description
            elseif (preg_match('/description[:\-]\s*(.+)/i', $line, $matches)) {
                $description = trim($matches[1]);
            }
            // Try to extract CTA
            elseif (preg_match('/call[-\s]*to[-\s]*action|cta[:\-]\s*(.+)/i', $line, $matches)) {
                $callToAction = trim($matches[1]);
            }
            // If no label, use first line as headline
            elseif (!$headline && mb_strlen($line) <= 100) {
                $headline = $line;
            }
            // Otherwise use as description
            elseif (!$description) {
                $description = $line;
            }
        }

        // Fallback values
        $headline = $headline ?? $parameters['headline'] ?? 'Discover More';
        $description = $description ?? $parameters['description'] ?? mb_substr(strip_tags($aiContent), 0, 200);
        $callToAction = $callToAction ?? $parameters['call_to_action'] ?? 'Learn More';

        return [
            'name' => $parameters['name'] ?? "{$platform} {$adType} Ad",
            'headline' => $headline,
            'description' => $description,
            'call_to_action' => $callToAction,
            'destination_url' => $parameters['destination_url'] ?? null,
            'content' => [
                'headline' => $headline,
                'description' => $description,
                'cta' => $callToAction,
            ],
            'metadata' => [
                'platform' => $platform,
                'ad_type' => $adType,
                'generated_at' => now()->toIso8601String(),
            ],
        ];
    }
}
