<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\EmailSuppression;
use App\Services\Email\SuppressionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class SuppressionController extends Controller
{
    private SuppressionService $suppressor;

    public function __construct(SuppressionService $suppressor)
    {
        $this->suppressor = $suppressor;
    }

    /**
     * GET /api/v1/email/suppressions
     */
    public function index(Request $request): JsonResponse
    {
        $client = $request->get('email_client');

        $suppressions = EmailSuppression::where('email_client_id', $client->id)
            ->orWhereNull('email_client_id')
            ->orderBy('created_at', 'desc')
            ->paginate(50);

        return response()->json([
            'status' => 'success',
            'data' => $suppressions,
        ]);
    }

    /**
     * POST /api/v1/email/suppressions
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'reason' => 'required|string',
        ]);

        $client = $request->get('email_client');

        $suppression = $this->suppressor->addSuppression(
            $validated['email'],
            $validated['reason'],
            'api',
            $client
        );

        // Security requirement: Log manual suppressions
        \Illuminate\Support\Facades\Log::info("Added suppression via API: {$validated['email']} for reason {$validated['reason']}", [
            'client_id' => $client->id,
            'actor' => 'api_client',
        ]);

        return response()->json([
            'status' => 'success',
            'data' => $suppression,
        ], 201);
    }

    /**
     * DELETE /api/v1/email/suppressions/{email}
     */
    public function destroy(Request $request, string $email): JsonResponse
    {
        $client = $request->get('email_client');

        $this->suppressor->removeSuppression($email, $client);

        // Security requirement: Log manual removals
        \Illuminate\Support\Facades\Log::info("Removed suppression via API: {$email}", [
            'client_id' => $client->id,
            'actor' => 'api_client',
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Suppression removed if it existed for this client.',
        ]);
    }
}
