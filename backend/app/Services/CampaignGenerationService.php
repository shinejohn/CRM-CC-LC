<?php

namespace App\Services;

use App\Models\Customer;
use App\Models\Conversation;
use App\Models\Knowledge;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class CampaignGenerationService
{
    public function __construct(
        private OpenRouterService $openRouterService
    ) {}

    /**
     * Generate campaign based on customer data and objectives
     */
    public function generateCampaign(array $parameters): array
    {
        $customerId = $parameters['customer_id'] ?? null;
        $campaignType = $parameters['type'] ?? 'Educational';
        $objective = $parameters['objective'] ?? 'educate';
        $targetAudience = $parameters['target_audience'] ?? null;
        $topic = $parameters['topic'] ?? null;

        // Build context from customer data if provided
        $context = $this->buildContext($customerId, $targetAudience);

        // Build prompt for campaign generation
        $prompt = $this->buildCampaignPrompt($campaignType, $objective, $topic, $context);

        // Call AI to generate campaign
        $messages = [
            [
                'role' => 'user',
                'content' => $prompt,
            ],
        ];

        $response = $this->openRouterService->chatCompletion($messages, [
            'system' => $this->getSystemPrompt(),
            'temperature' => 0.8,
            'max_tokens' => 4000,
        ]);

        if (!$response) {
            throw new \Exception('Failed to generate campaign from AI');
        }

        $aiContent = $response['choices'][0]['message']['content'] ?? '';

        // Parse AI response to structured campaign data
        $campaignData = $this->parseCampaignResponse($aiContent, $campaignType, $parameters);

        return $campaignData;
    }

    /**
     * Build context from customer data
     */
    private function buildContext(?string $customerId, ?string $targetAudience): array
    {
        $context = [
            'target_audience' => $targetAudience ?? 'small businesses',
        ];

        if ($customerId) {
            $customer = Customer::find($customerId);
            if ($customer) {
                $context['customer'] = [
                    'business_name' => $customer->business_name,
                    'industry' => $customer->industry_category ?? $customer->industry_id,
                    'subcategory' => $customer->industry_subcategory ?? $customer->sub_category,
                    'challenges' => $customer->challenges ?? [],
                    'goals' => $customer->goals ?? [],
                    'products_services' => $customer->products_services ?? [],
                ];

                // Get recent conversations for context
                $recentConversations = Conversation::where('customer_id', $customerId)
                    ->orderBy('started_at', 'desc')
                    ->limit(5)
                    ->get(['outcome', 'topics_discussed', 'questions_asked']);

                if ($recentConversations->isNotEmpty()) {
                    $context['recent_conversations'] = $recentConversations->map(function ($conv) {
                        return [
                            'outcome' => $conv->outcome,
                            'topics' => $conv->topics_discussed ?? [],
                            'questions' => $conv->questions_asked ?? [],
                        ];
                    })->toArray();
                }
            }
        }

        return $context;
    }

    /**
     * Build campaign generation prompt
     */
    private function buildCampaignPrompt(string $type, string $objective, ?string $topic, array $context): string
    {
        $prompt = "Generate a marketing campaign of type '{$type}' with the objective to '{$objective}'.\n\n";

        if ($topic) {
            $prompt .= "Topic: {$topic}\n\n";
        }

        if (isset($context['customer'])) {
            $customer = $context['customer'];
            $prompt .= "Target Customer:\n";
            $prompt .= "- Business: {$customer['business_name']}\n";
            if ($customer['industry']) {
                $prompt .= "- Industry: {$customer['industry']}\n";
            }
            if (!empty($customer['challenges'])) {
                $prompt .= "- Challenges: " . implode(', ', $customer['challenges']) . "\n";
            }
            if (!empty($customer['goals'])) {
                $prompt .= "- Goals: " . implode(', ', $customer['goals']) . "\n";
            }
            $prompt .= "\n";
        } else {
            $prompt .= "Target Audience: {$context['target_audience']}\n\n";
        }

        $prompt .= "Please provide a complete campaign structure in JSON format with the following fields:\n";
        $prompt .= "1. campaign: { id, type, title, subject, description }\n";
        $prompt .= "2. landing_page: { landing_page_slug, template_id, ai_persona, ai_tone, ai_goal, primary_cta, secondary_cta, conversion_goal }\n";
        $prompt .= "3. A brief outline for slides (key points for each slide)\n";
        $prompt .= "4. Suggested email subject line\n";
        $prompt .= "5. Key messaging points\n";

        return $prompt;
    }

    /**
     * System prompt for campaign generation
     */
    private function getSystemPrompt(): string
    {
        return "You are an expert marketing campaign strategist specializing in creating educational and engaging marketing campaigns for small businesses. 

Your campaigns should:
- Be clear, actionable, and valuable to the target audience
- Use conversational, friendly tone
- Focus on education, problem-solving, or value delivery
- Include strong calls-to-action
- Be optimized for email marketing and landing pages

Always respond with valid JSON that can be parsed. Structure your response as a JSON object with campaign, landing_page, and outline fields.";
    }

    /**
     * Parse AI response into structured campaign data
     */
    private function parseCampaignResponse(string $aiContent, string $type, array $parameters): array
    {
        // Try to extract JSON from response
        $jsonMatch = [];
        if (preg_match('/\{[\s\S]*\}/', $aiContent, $jsonMatch)) {
            $parsed = json_decode($jsonMatch[0], true);
            if ($parsed && isset($parsed['campaign'])) {
                return $this->structureCampaignData($parsed, $type, $parameters);
            }
        }

        // Fallback: build structure from text content
        return $this->buildCampaignFromText($aiContent, $type, $parameters);
    }

    /**
     * Structure campaign data with all required fields
     */
    private function structureCampaignData(array $parsed, string $type, array $parameters): array
    {
        $campaignId = $parsed['campaign']['id'] ?? $this->generateCampaignId($type);
        $slug = Str::slug($parsed['campaign']['title'] ?? $parsed['landing_page']['landing_page_slug'] ?? $campaignId);

        // Get template based on type
        $template = $this->getTemplateForType($type);

        return [
            'campaign' => [
                'id' => $campaignId,
                'week' => $parameters['week'] ?? 1,
                'day' => $parameters['day'] ?? 1,
                'type' => $type,
                'title' => $parsed['campaign']['title'] ?? 'New Campaign',
                'subject' => $parsed['campaign']['subject'] ?? $parsed['campaign']['title'] ?? 'New Campaign',
                'landing_page' => $slug,
                'template' => $template['template_id'],
                'description' => $parsed['campaign']['description'] ?? '',
            ],
            'landing_page' => [
                'campaign_id' => $campaignId,
                'landing_page_slug' => $slug,
                'url' => "/learn/{$slug}",
                'template_id' => $template['template_id'],
                'template_name' => $template['name'],
                'slide_count' => $template['slides'],
                'duration_seconds' => $template['duration'],
                'primary_cta' => $parsed['landing_page']['primary_cta'] ?? 'download_guide',
                'secondary_cta' => $parsed['landing_page']['secondary_cta'] ?? 'start_trial',
                'ai_persona' => $parsed['landing_page']['ai_persona'] ?? 'Sarah',
                'ai_tone' => $parsed['landing_page']['ai_tone'] ?? 'Knowledgeable, friendly',
                'ai_goal' => $parsed['landing_page']['ai_goal'] ?? 'Educate and engage',
                'data_capture_fields' => 'name, email, business_name, industry',
                'audio_base_url' => "https://cdn.fibonacco.com/presentations/{$slug}/audio/",
                'crm_tracking' => true,
                'conversion_goal' => $parsed['landing_page']['conversion_goal'] ?? 'education',
                'utm_source' => 'email',
                'utm_medium' => 'outbound',
                'utm_campaign' => $parameters['utm_campaign'] ?? "campaign-{$slug}",
                'utm_content' => $campaignId,
            ],
            'template' => $template,
            'slides' => $this->generateSlideStructure($template),
            'outline' => $parsed['outline'] ?? [],
            'suggestions' => $parsed['suggestions'] ?? [],
        ];
    }

    /**
     * Build campaign from text if JSON parsing fails
     */
    private function buildCampaignFromText(string $text, string $type, array $parameters): array
    {
        $campaignId = $this->generateCampaignId($type);
        $title = $this->extractTitle($text) ?? 'New Campaign';
        $slug = Str::slug($title);
        $template = $this->getTemplateForType($type);

        return [
            'campaign' => [
                'id' => $campaignId,
                'week' => $parameters['week'] ?? 1,
                'day' => $parameters['day'] ?? 1,
                'type' => $type,
                'title' => $title,
                'subject' => $title,
                'landing_page' => $slug,
                'template' => $template['template_id'],
                'description' => $text,
            ],
            'landing_page' => [
                'campaign_id' => $campaignId,
                'landing_page_slug' => $slug,
                'url' => "/learn/{$slug}",
                'template_id' => $template['template_id'],
                'template_name' => $template['name'],
                'slide_count' => $template['slides'],
                'duration_seconds' => $template['duration'],
                'primary_cta' => 'download_guide',
                'secondary_cta' => 'start_trial',
                'ai_persona' => 'Sarah',
                'ai_tone' => 'Knowledgeable, friendly',
                'ai_goal' => 'Educate and engage',
                'data_capture_fields' => 'name, email, business_name, industry',
                'audio_base_url' => "https://cdn.fibonacco.com/presentations/{$slug}/audio/",
                'crm_tracking' => true,
                'conversion_goal' => 'education',
                'utm_source' => 'email',
                'utm_medium' => 'outbound',
                'utm_campaign' => $parameters['utm_campaign'] ?? "campaign-{$slug}",
                'utm_content' => $campaignId,
            ],
            'template' => $template,
            'slides' => $this->generateSlideStructure($template),
            'outline' => [],
            'suggestions' => [],
        ];
    }

    /**
     * Get template structure based on campaign type
     */
    private function getTemplateForType(string $type): array
    {
        $templates = [
            'Educational' => [
                'template_id' => 'educational',
                'name' => 'Educational Content',
                'slides' => 7,
                'duration' => 75,
                'purpose' => 'education',
            ],
            'Hook' => [
                'template_id' => 'hook',
                'name' => 'Hook Campaign',
                'slides' => 6,
                'duration' => 45,
                'purpose' => 'hook',
            ],
            'HowTo' => [
                'template_id' => 'howto',
                'name' => 'How-To Guide',
                'slides' => 8,
                'duration' => 90,
                'purpose' => 'education',
            ],
        ];

        return $templates[$type] ?? $templates['Educational'];
    }

    /**
     * Generate slide structure based on template
     */
    private function generateSlideStructure(array $template): array
    {
        $slideComponents = [
            'educational' => ['HeroSlide', 'ConceptSlide', 'DataSlide', 'ComparisonSlide', 'ActionSlide', 'ResourceSlide', 'CTASlide'],
            'hook' => ['HeroSlide', 'ValuePropSlide', 'SocialProofSlide', 'UrgencySlide', 'CTASlide', 'FollowUpSlide'],
            'howto' => ['HeroSlide', 'OverviewSlide', 'StepSlide', 'StepSlide', 'StepSlide', 'StepSlide', 'TipSlide', 'CTASlide'],
        ];

        $components = $slideComponents[$template['template_id']] ?? $slideComponents['educational'];
        $slides = [];

        foreach ($components as $index => $component) {
            $slides[] = [
                'template_id' => $template['template_id'],
                'slide_num' => $index + 1,
                'component' => $component,
                'content_type' => strtolower(str_replace('Slide', '', $component)),
                'requires_personalization' => in_array($component, ['HeroSlide', 'CTASlide', 'ActionSlide']),
                'audio_file' => sprintf('slide-%02d-%s.mp3', $index + 1, strtolower(str_replace('Slide', '', $component))),
            ];
        }

        return $slides;
    }

    /**
     * Generate unique campaign ID
     */
    private function generateCampaignId(string $type): string
    {
        $prefix = match ($type) {
            'Educational' => 'EDU',
            'Hook' => 'HOOK',
            'HowTo' => 'HOWTO',
            default => 'CAMP',
        };

        return $prefix . '-' . str_pad((string) rand(1, 999), 3, '0', STR_PAD_LEFT);
    }

    /**
     * Extract title from text
     */
    private function extractTitle(string $text): ?string
    {
        // Try to find title in quotes or first line
        if (preg_match('/"([^"]+)"/', $text, $matches)) {
            return $matches[1];
        }

        $lines = explode("\n", $text);
        $firstLine = trim($lines[0] ?? '');
        
        if (strlen($firstLine) < 100 && strlen($firstLine) > 5) {
            return $firstLine;
        }

        return null;
    }

    /**
     * Get campaign templates/suggestions
     */
    public function getTemplates(): array
    {
        return [
            [
                'type' => 'Educational',
                'name' => 'Educational Content',
                'description' => 'Teach your audience something valuable',
                'best_for' => 'Building trust and authority',
                'slides' => 7,
                'duration' => 75,
            ],
            [
                'type' => 'Hook',
                'name' => 'Hook Campaign',
                'description' => 'Grab attention with compelling offer',
                'best_for' => 'Acquiring new leads quickly',
                'slides' => 6,
                'duration' => 45,
            ],
            [
                'type' => 'HowTo',
                'name' => 'How-To Guide',
                'description' => 'Step-by-step instructions',
                'best_for' => 'Guiding users through processes',
                'slides' => 8,
                'duration' => 90,
            ],
        ];
    }
}
