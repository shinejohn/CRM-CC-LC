<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ContentCard;
use App\Models\SyndicationPartner;
use App\Services\SyndicationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

final class SyndicationController extends Controller
{
    public function __construct(
        private SyndicationService $syndicationService
    ) {}

    public function register(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string',
            'email' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $partner = $this->syndicationService->registerPartner($request->user(), $validator->validated());

        return response()->json(['partner' => $partner], 201);
    }

    public function dashboard(Request $request): JsonResponse
    {
        $partner = SyndicationPartner::where('user_id', $request->user()->id)->firstOrFail();

        $currentEarnings = $this->syndicationService->calculateEarnings($partner, 'current_month');
        $allTimeEarnings = $this->syndicationService->calculateEarnings($partner, 'all_time');

        return response()->json([
            'partner' => $partner,
            'communities_count' => $partner->partnerCommunities()->where('status', 'active')->count(),
            'sponsors_count' => $partner->sponsorPlacements()->where('status', 'active')->count(),
            'current_month' => $currentEarnings,
            'all_time' => $allTimeEarnings,
        ]);
    }

    public function queue(Request $request): JsonResponse
    {
        $partner = SyndicationPartner::where('user_id', $request->user()->id)->firstOrFail();

        return response()->json($this->syndicationService->getDailyQueue($partner));
    }

    public function addCommunity(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'platform' => 'required|string',
            'group_name' => 'required|string',
            'group_url' => 'nullable|string',
            'member_count' => 'nullable|integer|min:0',
            'community_id' => 'nullable|string|exists:communities,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $partner = SyndicationPartner::where('user_id', $request->user()->id)->firstOrFail();

        $community = $this->syndicationService->addCommunity($partner, $validator->validated());

        return response()->json(['community' => $community], 201);
    }

    public function listCommunities(Request $request): JsonResponse
    {
        $partner = SyndicationPartner::where('user_id', $request->user()->id)->firstOrFail();

        $communities = $partner->partnerCommunities()
            ->with('community')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['communities' => $communities]);
    }

    public function removeCommunity(Request $request, string $id): JsonResponse
    {
        $partner = SyndicationPartner::where('user_id', $request->user()->id)->firstOrFail();

        $community = $partner->partnerCommunities()->findOrFail($id);
        $community->update(['status' => 'removed']);

        return response()->json(['message' => 'Community removed']);
    }

    public function sponsors(Request $request): JsonResponse
    {
        $partner = SyndicationPartner::where('user_id', $request->user()->id)->firstOrFail();

        $sponsors = $partner->sponsorPlacements()
            ->with('smb')
            ->where('status', 'active')
            ->get();

        return response()->json(['sponsors' => $sponsors]);
    }

    public function earnings(Request $request): JsonResponse
    {
        $partner = SyndicationPartner::where('user_id', $request->user()->id)->firstOrFail();

        $period = $request->input('period', 'current_month');

        return response()->json($this->syndicationService->calculateEarnings($partner, $period));
    }

    public function currentEarnings(Request $request): JsonResponse
    {
        $partner = SyndicationPartner::where('user_id', $request->user()->id)->firstOrFail();

        return response()->json($this->syndicationService->calculateEarnings($partner, 'current_month'));
    }

    public function markPosted(Request $request, string $cardId): JsonResponse
    {
        $card = ContentCard::findOrFail($cardId);
        $card->update(['posted_at' => now()]);

        return response()->json(['message' => 'Card marked as posted']);
    }
}
