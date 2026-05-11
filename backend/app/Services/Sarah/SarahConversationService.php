<?php

declare(strict_types=1);

namespace App\Services\Sarah;

use App\Models\AdvertiserSession;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Handles Sarah's AI-powered conversation during campaign landing page sessions.
 * Uses the Anthropic API to generate contextual responses based on campaign content.
 */
final class SarahConversationService
{
    /**
     * Generate an AI response to a user message within campaign context.
     *
     * @param  array<string, mixed>  $context  Campaign context (campaign_id, slide_index, slides, title, etc.)
     * @param  array<array{role: string, content: string}>  $history  Prior conversation messages
     * @return array{response: string, suggested_actions: array<array{label: string, value: string}>}
     */
    public function chat(string $message, array $context, array $history = []): array
    {
        $apiKey = config('services.anthropic.api_key');

        if (!$apiKey) {
            Log::warning('SarahConversationService: No Anthropic API key configured');

            return [
                'response' => "I appreciate your question! I'm still getting set up on the backend, but the presentation covers most common questions. Keep watching — and feel free to reach out to our team directly.",
                'suggested_actions' => [
                    ['label' => 'Continue watching', 'value' => "Let's keep going with the presentation."],
                ],
            ];
        }

        $systemPrompt = $this->buildSystemPrompt($context);
        $messages = $this->buildMessages($history, $message);

        try {
            $response = Http::withHeaders([
                'x-api-key' => $apiKey,
                'anthropic-version' => '2023-06-01',
                'content-type' => 'application/json',
            ])->timeout(15)->post('https://api.anthropic.com/v1/messages', [
                'model' => 'claude-sonnet-4-20250514',
                'max_tokens' => 300,
                'system' => $systemPrompt,
                'messages' => $messages,
            ]);

            if (!$response->successful()) {
                Log::error('SarahConversationService: API error', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);

                return $this->fallbackResponse();
            }

            $data = $response->json();
            $text = '';
            foreach (($data['content'] ?? []) as $block) {
                if (($block['type'] ?? '') === 'text') {
                    $text .= $block['text'];
                }
            }

            if (!$text) {
                return $this->fallbackResponse();
            }

            return [
                'response' => trim($text),
                'suggested_actions' => $this->generateSuggestedActions($context),
            ];
        } catch (\Throwable $e) {
            Log::error('SarahConversationService: Exception', ['error' => $e->getMessage()]);

            return $this->fallbackResponse();
        }
    }

    private function buildSystemPrompt(array $context): string
    {
        $title = $context['title'] ?? 'this presentation';
        $aiTone = $context['ai_tone'] ?? 'warm, professional, knowledgeable';
        $aiGoal = $context['ai_goal'] ?? 'help the viewer understand the value and take the next step';
        $slideIndex = $context['slide_index'] ?? 0;
        $slideTitle = $context['current_slide_title'] ?? '';
        $slideNarration = $context['current_slide_narration'] ?? '';
        $description = $context['description'] ?? '';

        $prompt = <<<PROMPT
You are Sarah, a friendly and knowledgeable AI business advisor at Fibonacco. You are guiding a local business owner through a presentation called "{$title}".

Your tone is: {$aiTone}
Your goal is: {$aiGoal}

About this presentation: {$description}

The viewer is currently on slide {$slideIndex}.
PROMPT;

        if ($slideTitle) {
            $prompt .= "\nCurrent slide title: {$slideTitle}";
        }
        if ($slideNarration) {
            $prompt .= "\nCurrent slide narration: " . mb_substr($slideNarration, 0, 500);
        }

        $prompt .= <<<RULES

Key rules:
- Keep responses concise (2-4 sentences max). This is a chat sidebar, not an essay.
- Be helpful and specific to the campaign topic. Reference the current slide when relevant.
- If asked about pricing, give general guidance and encourage them to continue watching or reach out.
- Never make up specific prices, packages, or promises that aren't in the presentation.
- If you don't know something, say so honestly and suggest they continue watching or contact the team.
- Use a conversational, encouraging tone. You're a helpful guide, not a salesperson.
RULES;

        return $prompt;
    }

    /**
     * @return array<array{role: string, content: string}>
     */
    private function buildMessages(array $history, string $newMessage): array
    {
        $messages = [];

        // Include last 10 messages of history for context
        $recent = array_slice($history, -10);
        foreach ($recent as $msg) {
            $role = ($msg['direction'] ?? $msg['role'] ?? 'user') === 'outbound' ? 'assistant' : 'user';
            $messages[] = [
                'role' => $role,
                'content' => $msg['message'] ?? $msg['content'] ?? '',
            ];
        }

        $messages[] = [
            'role' => 'user',
            'content' => $newMessage,
        ];

        return $messages;
    }

    /**
     * @return array{response: string, suggested_actions: array<array{label: string, value: string}>}
     */
    private function fallbackResponse(): array
    {
        return [
            'response' => "That's a great question! I'm having a moment — let me suggest you keep watching the presentation, which covers most common questions. You can also reach out to our team anytime.",
            'suggested_actions' => [
                ['label' => 'Continue watching', 'value' => "Let's keep going with the presentation."],
                ['label' => 'Contact the team', 'value' => 'How can I contact your team directly?'],
            ],
        ];
    }

    /**
     * @return array<array{label: string, value: string}>
     */
    private function generateSuggestedActions(array $context): array
    {
        $slideIndex = (int) ($context['slide_index'] ?? 0);
        $totalSlides = (int) ($context['total_slides'] ?? 10);

        if ($slideIndex >= $totalSlides - 1) {
            return [
                ['label' => 'Set this up for me', 'value' => "I'd like you to set this up for my business."],
                ['label' => 'What does it cost?', 'value' => 'How much does this cost?'],
            ];
        }

        return [
            ['label' => 'Tell me more', 'value' => 'Can you tell me more about this?'],
            ['label' => 'Next topic', 'value' => "Let's move on to the next topic."],
        ];
    }
}
