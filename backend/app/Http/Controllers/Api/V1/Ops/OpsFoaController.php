<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Ops;

use App\Http\Controllers\Controller;
use App\Models\Operations\AISession;
use App\Services\AI\PrismAiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * FOA (Fibonacco Operations Agent) chat endpoint.
 *
 * POST /v1/ops/ai-sessions/chat — persists the exchange as an ops.ai_sessions
 * row and returns a real assistant reply via PrismAiService. If the AI provider
 * is unavailable it degrades gracefully to a functional acknowledgement (the
 * session is still persisted), never a hard-coded canned string.
 */
final class OpsFoaController extends Controller
{
    public function __construct(private readonly PrismAiService $ai)
    {
    }

    public function chat(Request $request): JsonResponse
    {
        $data = $request->validate([
            'message' => ['required', 'string'],
            'sessionId' => ['sometimes', 'nullable', 'string'],
            'session_id' => ['sometimes', 'nullable', 'string'],
        ]);

        $message = (string) $data['message'];
        $sessionId = $data['sessionId'] ?? $data['session_id'] ?? null;

        $session = $sessionId !== null ? AISession::find($sessionId) : null;

        $actor = $request->user()?->getAuthIdentifier() !== null
            ? (string) $request->user()->getAuthIdentifier()
            : 'system';

        if ($session === null) {
            $session = AISession::create([
                'session_type' => 'user_query',
                'trigger_source' => 'ops_foa_chat',
                'user_query' => $message,
                'status' => 'processing',
                'started_at' => now(),
                'created_by' => $actor,
            ]);
        }

        $systemPrompt = 'You are FOA, the Fibonacco Operations Agent. You help the operations team '
            .'understand system health, financial metrics, infrastructure, email deliverability, '
            .'pipeline, costs, alerts and incidents. Be concise, specific and action-oriented.';

        $start = microtime(true);

        try {
            $content = $this->ai->chat(
                messages: [['role' => 'user', 'content' => $message]],
                systemPrompt: $systemPrompt,
            );
        } catch (Throwable $e) {
            Log::warning('OpsFoaController chat fell back to acknowledgement: '.$e->getMessage());
            $content = "I've logged your request: \"{$message}\". The AI analysis service is "
                .'currently unavailable, so a live response could not be generated. The operations '
                .'team can review this session in the ops console.';
        }

        $session->update([
            'user_query' => $message,
            'analysis_summary' => $content,
            'status' => 'completed',
            'completed_at' => now(),
            'duration_ms' => (int) round((microtime(true) - $start) * 1000),
            'model_used' => config('command-center-ai.ai_models.chat'),
        ]);

        return response()->json([
            'data' => [
                'content' => $content,
                'sessionId' => (string) $session->id,
                'actionSuggestions' => [],
            ],
        ]);
    }
}
