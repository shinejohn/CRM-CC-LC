<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Newsletter\Sponsor;
use App\Models\Newsletter\Sponsorship;
use App\Services\Newsletter\SponsorService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

final class SponsorController extends Controller
{
    public function __construct(
        private SponsorService $sponsorService
    ) {}

    /**
     * List sponsors
     */
    public function index(Request $request): JsonResponse
    {
        $query = Sponsor::with(['sponsorships']);

        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        // Cap per_page so ?per_page=100000000 can't force an unbounded query.
        $perPage = min((int) $request->get('per_page', 20), 100);
        $sponsors = $query->orderBy('name')->paginate($perPage);

        return response()->json($sponsors);
    }

    /**
     * Create sponsor
     */
    public function create(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'smb_id' => 'nullable|exists:smbs,id',
            'logo_url' => 'nullable|url|max:500',
            'website_url' => 'nullable|url|max:500',
            'tagline' => 'nullable|string|max:255',
            'contact_email' => 'nullable|email|max:255',
            'contact_name' => 'nullable|string|max:255',
            'is_active' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $sponsor = Sponsor::create($validator->validated());

        return response()->json([
            'message' => 'Sponsor created successfully.',
            'sponsor' => $sponsor,
        ], 201);
    }

    /**
     * Get sponsor
     */
    public function show(int $id): JsonResponse
    {
        $sponsor = Sponsor::with(['sponsorships', 'smb'])->findOrFail($id);

        return response()->json([
            'sponsor' => $sponsor,
        ]);
    }

    /**
     * Update sponsor
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'smb_id' => 'nullable|exists:smbs,id',
            'logo_url' => 'nullable|url|max:500',
            'website_url' => 'nullable|url|max:500',
            'tagline' => 'nullable|string|max:255',
            'contact_email' => 'nullable|email|max:255',
            'contact_name' => 'nullable|string|max:255',
            'is_active' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $sponsor = Sponsor::findOrFail($id);
        $sponsor->update($validator->validated());

        return response()->json([
            'message' => 'Sponsor updated successfully.',
            'sponsor' => $sponsor->fresh(),
        ]);
    }

    /**
     * Get sponsorships for sponsor
     */
    public function sponsorships(int $id): JsonResponse
    {
        $sponsor = Sponsor::findOrFail($id);
        $sponsorships = $sponsor->sponsorships()
            ->with(['community'])
            ->orderBy('start_date', 'desc')
            ->get();

        return response()->json([
            'sponsor' => $sponsor,
            'sponsorships' => $sponsorships,
        ]);
    }

    /**
     * Create sponsorship
     */
    public function createSponsorship(Request $request, int $id): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'sponsorship_type' => 'required|in:newsletter_header,newsletter_section,alert_sponsor',
            'community_id' => 'nullable|exists:communities,id',
            // advertiser_name and campaign_name are NOT NULL in the sponsorships table —
            // without them the insert fails at runtime, so require them here.
            'advertiser_name' => 'required|string|max:255',
            'campaign_name' => 'required|string|max:255',
            'advertiser_url' => 'nullable|url|max:255',
            'logo_path' => 'nullable|string|max:255',
            'display_copy' => 'nullable|string',
            'cta_text' => 'nullable|string|max:50',
            'total_budget_cents' => 'nullable|integer|min:0',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'impressions_purchased' => 'required|integer|min:1',
            'creative_json' => 'nullable|array',
            'rate_type' => 'required|in:cpm,flat,cpc',
            'rate_cents' => 'required|integer|min:0',
            'total_value_cents' => 'required|integer|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $sponsor = Sponsor::findOrFail($id);
        $sponsorship = $sponsor->sponsorships()->create($validator->validated());

        return response()->json([
            'message' => 'Sponsorship created successfully.',
            'sponsorship' => $sponsorship,
        ], 201);
    }

    /**
     * Get sponsor performance
     */
    public function performance(Request $request, int $id): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $report = $this->sponsorService->getPerformance(
            $id,
            Carbon::parse($request->start_date),
            Carbon::parse($request->end_date)
        );

        return response()->json([
            'sponsor_id' => $id,
            'report' => $report,
        ]);
    }
}



