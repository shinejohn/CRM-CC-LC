<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ContentCard;
use App\Models\SMB;
use App\Services\ContentCardService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class ContentCardController extends Controller
{
    public function __construct(
        private ContentCardService $contentCardService
    ) {}

    public function today(Request $request): JsonResponse
    {
        $user = $request->user();
        $smb = SMB::where('primary_email', $user->email)->first();

        if (!$smb) {
            return response()->json(['error' => 'No business profile found'], 404);
        }

        $card = $this->contentCardService->getCardForSmb($smb);

        if (!$card) {
            return response()->json(['card' => null, 'content_type' => $this->contentCardService->getContentTypeForDay()]);
        }

        return response()->json(['card' => $card]);
    }

    public function preview(Request $request, string $type): JsonResponse
    {
        $user = $request->user();
        $smb = SMB::where('primary_email', $user->email)->first();

        if (!$smb) {
            return response()->json(['error' => 'No business profile found'], 404);
        }

        $card = $this->contentCardService->getCardForSmb($smb, $type);

        return response()->json(['card' => $card, 'content_type' => $type]);
    }

    public function history(Request $request): JsonResponse
    {
        $user = $request->user();
        $smb = SMB::where('primary_email', $user->email)->first();

        if (!$smb) {
            return response()->json(['error' => 'No business profile found'], 404);
        }

        $cards = ContentCard::where('smb_id', $smb->id)
            ->orderBy('date_for', 'desc')
            ->paginate($request->integer('per_page', 20));

        return response()->json($cards);
    }
}
