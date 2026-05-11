<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AdvertiserSession;
use App\Services\Sarah\SarahConversationService;
use App\Services\Sarah\SarahMessageService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

/**
 * Public endpoint for Sarah AI chat during campaign landing page sessions.
 * No auth required — rate limited by IP (10/min).
 */
final class SarahChatController extends Controller
{
    public function __construct(
        private readonly SarahConversationService $conversationService,
        private readonly SarahMessageService $messageService,
    ) {}

    public function chat(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'message' => 'required|string|max:1000',
            'campaign_id' => 'required|string|max:255',
            'slide_index' => 'nullable|integer|min:0',
            'session_id' => 'nullable|uuid',
            'context' => 'nullable|array',
            'context.title' => 'nullable|string|max:500',
            'context.description' => 'nullable|string|max:2000',
            'context.ai_tone' => 'nullable|string|max:200',
            'context.ai_goal' => 'nullable|string|max:500',
            'context.current_slide_title' => 'nullable|string|max:500',
            'context.current_slide_narration' => 'nullable|string|max:2000',
            'context.total_slides' => 'nullable|integer|min:1',
        ]);

        $message = $validated['message'];
        $campaignId = $validated['campaign_id'];
        $slideIndex = $validated['slide_index'] ?? 0;
        $sessionId = $validated['session_id'] ?? null;
        $extraContext = $validated['context'] ?? [];

        // Resolve or create session lazily
        $session = $this->resolveSession($sessionId, $campaignId, $request);

        // Build context for AI
        $context = array_merge($extraContext, [
            'campaign_id' => $campaignId,
            'slide_index' => $slideIndex,
        ]);

        // Get conversation history from the session
        $history = [];
        if ($session) {
            $history = $this->messageService->getConversation($session)
                ->map(fn ($m) => [
                    'role' => $m->direction === 'outbound' ? 'assistant' : 'user',
                    'direction' => $m->direction,
                    'message' => $m->message,
                ])
                ->toArray();

            // Record the user's message
            $this->messageService->recordUserMessage(
                $session,
                'chat',
                $message,
                ['slide_index' => $slideIndex],
            );
        }

        // Generate AI response
        $result = $this->conversationService->chat($message, $context, $history);

        // Store Sarah's response
        if ($session) {
            $this->messageService->send(
                $session,
                'chat',
                $result['response'],
                ['slide_index' => $slideIndex, 'ai_generated' => true],
            );
        }

        return response()->json([
            'response' => $result['response'],
            'suggested_actions' => $result['suggested_actions'],
            'session_id' => $session?->id,
        ]);
    }

    private function resolveSession(?string $sessionId, string $campaignId, Request $request): ?AdvertiserSession
    {
        if ($sessionId) {
            $session = AdvertiserSession::find($sessionId);
            if ($session) {
                $session->update(['last_active_at' => now()]);

                return $session;
            }
        }

        // Create a new session for this visitor
        try {
            return AdvertiserSession::create([
                'source_platform' => 'learning_center',
                'source_url' => $request->header('Referer', ''),
                'visitor_type' => 'anonymous',
                'status' => 'intake',
                'last_active_at' => now(),
            ]);
        } catch (\Throwable $e) {
            Log::warning('SarahChatController: Failed to create session', ['error' => $e->getMessage()]);

            return null;
        }
    }
}
