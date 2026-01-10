<?php

namespace App\Services;

use App\Models\ContentTemplate;
use App\Models\GeneratedContent;
use App\Models\OutboundCampaign;
use Illuminate\Support\Facades\Log;

class ContentGenerationService
{
    protected OpenRouterService $openRouterService;

    public function __construct(OpenRouterService $openRouterService)
    {
        $this->openRouterService = $openRouterService;
    }

    /**
     * Generate content from campaign
     */
    public function generateFromCampaign(
        string $campaignId,
        string $type,
        ?string $templateId = null,
        array $parameters = []
    ): GeneratedContent {
        // Load campaign data
        $campaign = OutboundCampaign::findOrFail($campaignId);
        
        // Get template
        $template = $templateId 
            ? ContentTemplate::find($templateId)
            : ContentTemplate::where('type', $type)
                ->where('tenant_id', $campaign->tenant_id)
                ->where('is_active', true)
                ->first();

        // Build generation context
        $context = $this->buildContext($campaign, $parameters);
        
        // Build prompt
        $prompt = $template 
            ? $template->renderPrompt($context)
            : $this->buildDefaultPrompt($type, $context);

        // Generate content via AI
        $messages = [
            ['role' => 'system', 'content' => $this->getSystemPrompt($type)],
            ['role' => 'user', 'content' => $prompt],
        ];

        $response = $this->openRouterService->chatCompletion($messages, [
            'temperature' => 0.8,
            'max_tokens' => 4000,
        ]);

        if (!$response) {
            throw new \Exception('Failed to generate content from AI');
        }

        $aiContent = $response['choices'][0]['message']['content'] ?? '';
        
        // Parse and structure content
        $contentData = $this->parseContentResponse($aiContent, $type, $parameters);

        // Create content record
        $content = GeneratedContent::create([
            'tenant_id' => $campaign->tenant_id,
            'title' => $contentData['title'],
            'slug' => $this->generateSlug($contentData['title']),
            'type' => $type,
            'status' => 'draft',
            'content' => $contentData['content'],
            'excerpt' => $contentData['excerpt'] ?? null,
            'metadata' => $contentData['metadata'] ?? [],
            'campaign_id' => $campaignId,
            'template_id' => $template?->id,
            'generation_params' => $parameters,
        ]);

        // Create initial version
        $content->createVersion('Initial AI-generated content');

        // Record workflow action
        $content->recordWorkflowAction('created', null, 'draft');

        return $content;
    }

    /**
     * Generate content from scratch
     */
    public function generate(
        string $tenantId,
        string $type,
        array $parameters,
        ?string $templateId = null
    ): GeneratedContent {
        // Get template
        $template = $templateId 
            ? ContentTemplate::find($templateId)
            : ContentTemplate::where('type', $type)
                ->where('tenant_id', $tenantId)
                ->where('is_active', true)
                ->first();

        // Build context
        $context = $parameters;

        // Build prompt
        $prompt = $template 
            ? $template->renderPrompt($context)
            : $this->buildDefaultPrompt($type, $context);

        // Generate content via AI
        $messages = [
            ['role' => 'system', 'content' => $this->getSystemPrompt($type)],
            ['role' => 'user', 'content' => $prompt],
        ];

        $response = $this->openRouterService->chatCompletion($messages, [
            'temperature' => 0.8,
            'max_tokens' => 4000,
        ]);

        if (!$response) {
            throw new \Exception('Failed to generate content from AI');
        }

        $aiContent = $response['choices'][0]['message']['content'] ?? '';
        
        // Parse and structure content
        $contentData = $this->parseContentResponse($aiContent, $type, $parameters);

        // Create content record
        $content = GeneratedContent::create([
            'tenant_id' => $tenantId,
            'title' => $contentData['title'],
            'slug' => $this->generateSlug($contentData['title']),
            'type' => $type,
            'status' => 'draft',
            'content' => $contentData['content'],
            'excerpt' => $contentData['excerpt'] ?? null,
            'metadata' => $contentData['metadata'] ?? [],
            'template_id' => $template?->id,
            'generation_params' => $parameters,
        ]);

        // Create initial version
        $content->createVersion('Initial AI-generated content');

        // Record workflow action
        $content->recordWorkflowAction('created', null, 'draft');

        return $content;
    }

    /**
     * Build context from campaign
     */
    private function buildContext(OutboundCampaign $campaign, array $parameters): array
    {
        $context = [
            'campaign_name' => $campaign->name,
            'campaign_type' => $campaign->type,
            'campaign_message' => $campaign->message,
            'campaign_subject' => $campaign->subject ?? '',
        ];

        if ($campaign->recipient_segments) {
            $context['target_audience'] = json_encode($campaign->recipient_segments);
        }

        return array_merge($context, $parameters);
    }

    /**
     * Build default prompt
     */
    private function buildDefaultPrompt(string $type, array $context): string
    {
        $prompts = [
            'article' => "Write a comprehensive article titled '{{title}}' about {{topic}}. Include: introduction, main points, and conclusion.",
            'blog' => "Write a blog post titled '{{title}}' about {{topic}}. Make it engaging and conversational.",
            'social' => "Create a social media post about {{topic}}. Make it concise and engaging.",
            'email' => "Write an email about {{topic}} with subject line '{{subject}}'. Include: greeting, main message, and call-to-action.",
            'landing_page' => "Create landing page content titled '{{title}}' about {{topic}}. Include: headline, subheadline, benefits, features, and call-to-action.",
        ];

        $template = $prompts[$type] ?? $prompts['article'];

        foreach ($context as $key => $value) {
            $placeholder = "{{{$key}}}";
            $template = str_replace($placeholder, (string) $value, $template);
        }

        return $template;
    }

    /**
     * Get system prompt for content type
     */
    private function getSystemPrompt(string $type): string
    {
        $prompts = [
            'article' => 'You are a professional article writer. Create well-structured, informative articles.',
            'blog' => 'You are a blog writer. Create engaging, conversational blog posts.',
            'social' => 'You are a social media content creator. Create concise, engaging social media posts.',
            'email' => 'You are an email copywriter. Create compelling, action-oriented email content.',
            'landing_page' => 'You are a landing page copywriter. Create persuasive, conversion-focused landing page content.',
        ];

        return $prompts[$type] ?? 'You are a professional content writer. Create high-quality content.';
    }

    /**
     * Parse AI response into structured content
     */
    private function parseContentResponse(string $aiContent, string $type, array $parameters): array
    {
        // Extract title
        $title = $parameters['title'] ?? $this->extractTitle($aiContent);

        // For now, use the AI content as-is
        // In production, you might want more sophisticated parsing
        $content = $aiContent;

        // Extract excerpt (first 200 characters)
        $excerpt = mb_substr(strip_tags($aiContent), 0, 200);

        // Build metadata
        $metadata = [
            'word_count' => str_word_count(strip_tags($content)),
            'generated_at' => now()->toIso8601String(),
        ];

        if (isset($parameters['tags'])) {
            $metadata['tags'] = $parameters['tags'];
        }

        if (isset($parameters['category'])) {
            $metadata['category'] = $parameters['category'];
        }

        return [
            'title' => $title,
            'content' => $content,
            'excerpt' => $excerpt,
            'metadata' => $metadata,
        ];
    }

    /**
     * Extract title from content
     */
    private function extractTitle(string $content): string
    {
        // Try to extract title from markdown header
        if (preg_match('/^#\s+(.+)$/m', $content, $matches)) {
            return trim($matches[1]);
        }

        // Try to extract from HTML title tag
        if (preg_match('/<h1[^>]*>(.*?)<\/h1>/i', $content, $matches)) {
            return strip_tags(trim($matches[1]));
        }

        // Use first line
        $lines = explode("\n", $content);
        $firstLine = trim($lines[0]);
        
        return mb_substr(strip_tags($firstLine), 0, 100) ?: 'Untitled Content';
    }

    /**
     * Generate slug from title
     */
    private function generateSlug(string $title): string
    {
        $slug = strtolower($title);
        $slug = preg_replace('/[^a-z0-9]+/', '-', $slug);
        $slug = trim($slug, '-');
        $slug .= '-' . substr(md5($title . time()), 0, 6);
        
        return $slug;
    }
}
