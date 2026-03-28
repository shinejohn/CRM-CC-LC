<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\Email\EmailDispatchService;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

final class EmailSendController extends Controller
{
    private EmailDispatchService $dispatcher;

    public function __construct(EmailDispatchService $dispatcher)
    {
        $this->dispatcher = $dispatcher;
    }

    /**
     * POST /api/v1/email/send
     */
    public function send(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'to' => 'required|email',
            'from' => 'required|email',
            'subject' => 'required|string',
            'class' => 'nullable|string',
            'plain_body' => 'nullable|string',
            'html_body' => 'nullable|string',
            'metadata' => 'nullable|array',
        ]);

        if (empty($validated['plain_body']) && empty($validated['html_body'])) {
            return response()->json(['error' => 'Must provide plain_body or html_body.'], 422);
        }

        try {
            $client = $request->get('email_client');
            $result = $this->dispatcher->dispatch($client, $validated);

            if ($result['status'] === 'suppressed') {
                return response()->json([
                    'status' => 'suppressed',
                    'message' => $result['message'],
                ], 422);
            }

            return response()->json([
                'status' => 'success',
                'data' => $result,
            ], 202);

        } catch (Exception $e) {
            Log::error('Email send failed: '.$e->getMessage());

            return response()->json(['error' => $e->getMessage()], 400);
        }
    }

    /**
     * POST /api/v1/email/batch
     */
    public function batch(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'messages' => 'required|array|max:100',
            'messages.*.to' => 'required|email',
            'messages.*.from' => 'required|email',
            'messages.*.subject' => 'required|string',
            'messages.*.class' => 'nullable|string',
            'messages.*.plain_body' => 'nullable|string',
            'messages.*.html_body' => 'nullable|string',
            'messages.*.metadata' => 'nullable|array',
        ]);

        $client = $request->get('email_client');
        $results = [];

        foreach ($validated['messages'] as $messageData) {
            try {
                $results[] = $this->dispatcher->dispatch($client, $messageData);
            } catch (Exception $e) {
                $results[] = [
                    'status' => 'error',
                    'error' => $e->getMessage(),
                    'to' => $messageData['to'] ?? null,
                ];
            }
        }

        return response()->json([
            'status' => 'success',
            'data' => ['results' => $results],
        ], 207); // Multi-Status
    }
}
