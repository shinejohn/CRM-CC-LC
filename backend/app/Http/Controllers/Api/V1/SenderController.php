<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\EmailSender;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class SenderController extends Controller
{
    /**
     * GET /api/v1/email/senders
     */
    public function index(Request $request): JsonResponse
    {
        $client = $request->get('email_client');

        $senders = EmailSender::where('email_client_id', $client->id)
            ->orderBy('email_address')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $senders,
        ]);
    }

    /**
     * POST /api/v1/email/senders
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => 'required|email',
        ]);

        $client = $request->get('email_client');

        $exists = EmailSender::where('email_address', $validated['email'])
            ->where('email_client_id', $client->id)
            ->exists();

        if ($exists) {
            return response()->json(['error' => 'Sender already exists for this client.'], 422);
        }

        $sender = EmailSender::create([
            'email_client_id' => $client->id,
            'email_address' => $validated['email'],
            'is_verified' => false,
        ]);

        return response()->json([
            'status' => 'success',
            'data' => $sender,
        ], 201);
    }
}
