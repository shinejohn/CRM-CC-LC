<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AiPersonality;
use App\Models\Customer;
use App\Models\Knowledge;
use App\Services\AI\PrismAiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Symfony\Component\HttpFoundation\StreamedResponse;

final class AIController extends Controller
{
    public function __construct(private readonly PrismAiService $aiService) {}

    /**
     * POST /v1/ai/chat
     *
     * Supports both streaming (stream: true → SSE) and sync (stream: false → JSON).
     */
    public function chat(Request $request): JsonResponse|StreamedResponse
    {
        $validator = Validator::make($request->all(), [
            'messages'         => 'required|array|min:1',
            'messages.*.role'  => 'required|in:user,assistant,system',
            'messages.*.content' => 'required|string',
            'stream'           => 'boolean',
            'context'          => 'nullable|array',
            'personality_id'   => 'nullable|uuid|exists:ai_personalities,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $messages = $request->input('messages');
        $stream   = (bool) $request->input('stream', false);
        $context  = $request->input('context', []);
        $personalityId = $request->input('personality_id');

        $systemPrompt = $this->buildSystemPrompt($request, $context, $personalityId);

        if ($stream) {
            return $this->streamResponse($messages, $systemPrompt);
        }

        try {
            $text = $this->aiService->chat($messages, $systemPrompt);

            $actions     = $this->parseActions($text);
            $cleanedText = $this->stripActionBlocks($text);

            return response()->json([
                'data' => [
                    'content'           => $cleanedText,
                    'suggested_actions' => $actions,
                    'model'             => config('command-center-ai.ai_models.chat'),
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('AIController::chat error', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'AI service unavailable'], 500);
        }
    }

    /**
     * POST /v1/ai/generate
     *
     * Content generation for emails, SMS, social posts, etc.
     */
    public function generate(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'type'           => 'required|in:email,sms,social,article,ad',
            'prompt'         => 'required|string',
            'context'        => 'nullable|array',
            'personality_id' => 'nullable|uuid|exists:ai_personalities,id',
            'template'       => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $type          = $request->input('type');
        $prompt        = $request->input('prompt');
        $context       = $request->input('context', []);
        $personalityId = $request->input('personality_id');
        $template      = $request->input('template');

        $systemPrompt = $this->buildGenerationSystemPrompt($type, $context, $personalityId);
        $fullPrompt   = $template ? "{$template}\n\n{$prompt}" : $prompt;

        try {
            $content = $this->aiService->chat(
                [['role' => 'user', 'content' => $fullPrompt]],
                $systemPrompt,
                config('command-center-ai.ai_models.actions')
            );

            return response()->json([
                'data' => [
                    'id'      => \Illuminate\Support\Str::uuid()->toString(),
                    'content' => $content,
                    'metadata' => [
                        'type'   => $type,
                        'tokens' => 0,
                        'model'  => config('command-center-ai.ai_models.actions'),
                    ],
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('AIController::generate error', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Content generation failed'], 500);
        }
    }

    /**
     * GET /v1/ai/personalities
     */
    public function personalities(): JsonResponse
    {
        $personalities = AiPersonality::orderBy('name')->get([
            'id', 'name', 'description', 'system_prompt', 'traits', 'capabilities', 'avatar',
        ]);

        return response()->json([
            'data' => $personalities->map(fn ($p) => [
                'id'           => $p->id,
                'name'         => $p->name,
                'description'  => $p->description,
                'systemPrompt' => $p->system_prompt,
                'traits'       => $p->traits ?? [],
                'capabilities' => $p->capabilities ?? [],
                'avatar'       => $p->avatar,
            ]),
        ]);
    }

    /**
     * GET /v1/ai/personalities/{id}
     */
    public function personality(string $id): JsonResponse
    {
        $personality = AiPersonality::findOrFail($id);

        return response()->json([
            'data' => [
                'id'           => $personality->id,
                'name'         => $personality->name,
                'description'  => $personality->description,
                'systemPrompt' => $personality->system_prompt,
                'traits'       => $personality->traits ?? [],
                'capabilities' => $personality->capabilities ?? [],
                'avatar'       => $personality->avatar,
            ],
        ]);
    }

    /**
     * POST /v1/ai/personalities/{id}/generate-response
     */
    public function generateWithPersonality(Request $request, string $id): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'prompt'  => 'required|string',
            'context' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $personality = AiPersonality::findOrFail($id);

        $systemPrompt = $personality->system_prompt;
        if (!empty($request->input('context'))) {
            $systemPrompt .= "\n\nCURRENT CONTEXT:\n" . json_encode($request->input('context'), JSON_PRETTY_PRINT);
        }

        try {
            $content = $this->aiService->chat(
                [['role' => 'user', 'content' => $request->input('prompt')]],
                $systemPrompt
            );

            return response()->json([
                'data' => ['content' => $content],
            ]);
        } catch (\Exception $e) {
            Log::error('AIController::generateWithPersonality error', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Personality response failed'], 500);
        }
    }

    /**
     * POST /v1/ai/context
     */
    public function getContext(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'customer_id' => 'nullable|uuid|exists:customers,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user     = $request->user();
        $context  = $this->buildAIContextData($user->tenant_id ?? $user->id, $request->input('customer_id'));

        return response()->json(['data' => $context]);
    }

    /**
     * GET /v1/ai/models
     */
    public function models(): JsonResponse
    {
        return response()->json([
            'data' => [
                ['id' => config('command-center-ai.ai_models.chat'),     'name' => 'Chat (Sonnet)',    'use_case' => 'chat'],
                ['id' => config('command-center-ai.ai_models.actions'),  'name' => 'Actions (Sonnet)', 'use_case' => 'actions'],
                ['id' => config('command-center-ai.ai_models.analysis'), 'name' => 'Analysis (Haiku)', 'use_case' => 'analysis'],
            ],
        ]);
    }

    // ── Streaming ──────────────────────────────────────────────────────────────

    private function streamResponse(array $messages, string $systemPrompt): StreamedResponse
    {
        return response()->stream(function () use ($messages, $systemPrompt): void {
            foreach ($this->aiService->streamChat($messages, $systemPrompt) as $chunk) {
                if (isset($chunk['error'])) {
                    echo 'data: ' . json_encode(['error' => $chunk['error']]) . "\n\n";
                    ob_flush();
                    flush();
                    return;
                }

                echo 'data: ' . json_encode($chunk) . "\n\n";
                ob_flush();
                flush();
            }

            echo "data: [DONE]\n\n";
            ob_flush();
            flush();
        }, Response::HTTP_OK, [
            'Content-Type'      => 'text/event-stream',
            'Cache-Control'     => 'no-cache, no-store',
            'X-Accel-Buffering' => 'no',
            'Connection'        => 'keep-alive',
        ]);
    }

    // ── System Prompt Builders ─────────────────────────────────────────────────

    private function buildSystemPrompt(Request $request, array $context, ?string $personalityId): string
    {
        $user = $request->user();

        // Base identity
        $lines = [
            "You are Sarah, an AI Account Manager for Fibonacco, helping local businesses succeed with AI-powered marketing and advertising.",
            "",
            "You assist the user — a Fibonacco account manager — with customer management, pipeline tracking, content creation, and business intelligence.",
        ];

        // Personality override
        if ($personalityId) {
            $personality = AiPersonality::find($personalityId);
            if ($personality) {
                $lines = [$personality->system_prompt];
            }
        }

        // Module context
        if (!empty($context['currentPage'])) {
            $lines[] = "";
            $lines[] = "CURRENT MODULE: " . $context['currentPage'];
        }

        // Business context
        if (!empty($context['businessContext'])) {
            $lines[] = "BUSINESS CONTEXT: " . json_encode($context['businessContext']);
        }

        // Customer context — scoped to tenant to prevent cross-tenant data leaks
        if (!empty($context['customerId'])) {
            $tenantId = $user?->tenant_id ?? $user?->id ?? null;
            $customer = $tenantId
                ? Customer::where('tenant_id', $tenantId)->find($context['customerId'])
                : null;
            if ($customer) {
                $lines[] = "";
                $lines[] = "ACTIVE CUSTOMER:";
                $lines[] = "- Business: {$customer->business_name}";
                $lines[] = "- Owner: {$customer->owner_name}";
                $lines[] = "- Industry: {$customer->industry_category}";
                $lines[] = "- Lead Score: {$customer->lead_score}";
            }
        }

        // Intelligence summary
        if (!empty($context['intelligence_summary'])) {
            $lines[] = "";
            $lines[] = "BUSINESS INTELLIGENCE SUMMARY:";
            $lines[] = $context['intelligence_summary'];
        }

        // Available actions
        $lines[] = "";
        $lines[] = $this->getAvailableActionsPromptSection();

        return implode("\n", $lines);
    }

    private function buildGenerationSystemPrompt(string $type, array $context, ?string $personalityId): string
    {
        $typeInstructions = [
            'email'   => "Write a professional email for a local business. Be concise, warm, and action-oriented.",
            'sms'     => "Write an SMS message for a local business. Keep it under 160 characters. Direct and friendly.",
            'social'  => "Write a social media post for a local business. Engaging, authentic, appropriate hashtags.",
            'article' => "Write a helpful article for a local business audience. Informative and well-structured.",
            'ad'      => "Write ad copy for a local business. Compelling headline, clear value proposition, strong CTA.",
        ];

        $lines = [
            $typeInstructions[$type] ?? "Generate content for a local business.",
        ];

        if ($personalityId) {
            $personality = AiPersonality::find($personalityId);
            if ($personality) {
                $lines[] = "";
                $lines[] = "PERSONALITY/TONE: " . $personality->system_prompt;
            }
        }

        if (!empty($context)) {
            $lines[] = "";
            $lines[] = "CONTEXT: " . json_encode($context);
        }

        return implode("\n", $lines);
    }

    private function getAvailableActionsPromptSection(): string
    {
        return <<<ACTIONS
AVAILABLE ACTIONS:
When you need to perform an action, output it on its own line using this exact format:
ACTION: {"name": "action_name", "arguments": {...}}

Available actions:
- lookup_customer: Search for a customer by name or ID
- create_followup_task: Create a follow-up task for a customer (REQUIRES CONFIRMATION)
- draft_email: Draft an outbound email to a customer (REQUIRES CONFIRMATION)
- update_deal_stage: Move a deal to a new pipeline stage (REQUIRES CONFIRMATION)
- generate_pitch: Generate a sales pitch for a product/customer combination
- get_pipeline_summary: Return current pipeline stats
- lookup_product_pricing: Return pricing details for a Fibonacco tier
- schedule_callback: Schedule a callback for a customer (REQUIRES CONFIRMATION)
- generate_social_post: Draft a social media post for a customer (REQUIRES CONFIRMATION)
- run_diagnostic: Run a marketing diagnostic on a customer's services

Only use actions when the user explicitly requests an action or when an action is clearly needed to answer their question.
ACTIONS;
    }

    // ── Context & Helpers ──────────────────────────────────────────────────────

    private function buildAIContextData(string $tenantId, ?string $customerId): array
    {
        $context = [
            'product_knowledge' => [],
            'faqs'              => [],
            'customer_data'     => null,
        ];

        $knowledge = Knowledge::where('tenant_id', $tenantId)
            ->where('is_public', true)
            ->orderBy('usage_count', 'desc')
            ->limit(20)
            ->get(['title', 'content', 'category']);

        foreach ($knowledge as $item) {
            if ($item->category === 'faq') {
                $context['faqs'][] = ['question' => $item->title, 'answer' => $item->content];
            } else {
                $context['product_knowledge'][] = ['title' => $item->title, 'content' => $item->content];
            }
        }

        if ($customerId) {
            $customer = Customer::where('tenant_id', $tenantId)->find($customerId);
            if ($customer) {
                $context['customer_data'] = [
                    'business_name' => $customer->business_name,
                    'owner_name'    => $customer->owner_name,
                    'industry'      => $customer->industry_category,
                    'lead_score'    => $customer->lead_score,
                ];
            }
        }

        return $context;
    }

    private function parseActions(string $response): array
    {
        $actions = [];
        if (preg_match_all('/ACTION:\s*(\{.*?\})/s', $response, $matches)) {
            foreach ($matches[1] as $match) {
                $action = json_decode($match, true);
                if ($action) {
                    $actions[] = $action;
                }
            }
        }
        return $actions;
    }

    private function stripActionBlocks(string $response): string
    {
        return trim(preg_replace('/ACTION:\s*\{.*?\}/s', '', $response));
    }
}
