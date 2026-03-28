<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\BusinessIngestService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class BusinessIngestController extends Controller
{
    public function __construct(
        private BusinessIngestService $ingestService
    ) {}

    public function ingest(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'external_id' => 'required|string|max:255',
            'community_id' => 'required|integer|exists:communities,id',
            'business_name' => 'required|string|max:255',
            'dba_name' => 'nullable|string|max:255',
            'business_type' => 'nullable|string|max:100',
            'category' => 'nullable|string|max:100',
            'sub_category' => 'nullable|string|max:100',
            'owner_name' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'website' => 'nullable|url|max:500',
            'address' => 'nullable|string|max:500',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:50',
            'zip' => 'nullable|string|max:20',
            'coordinates' => 'nullable|array',
            'google_rating' => 'nullable|numeric|min:0|max:5',
            'google_review_count' => 'nullable|integer|min:0',
            'hours' => 'nullable|array',
            'enrichment_data' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $validated = $validator->validated();
        $validated['community_id'] = (int) $validated['community_id'];

        $result = $this->ingestService->ingestBusiness($validated);

        return response()->json([
            'message' => $result['created'] ? 'Business imported as new lead' : 'Business updated',
            'customer_id' => $result['customer_id'],
            'pipeline_stage' => $result['pipeline_stage'],
        ], $result['created'] ? 201 : 200);
    }

    public function batchIngest(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'community_id' => 'required|integer|exists:communities,id',
            'businesses' => 'required|array|min:1|max:500',
            'businesses.*.external_id' => 'required|string|max:255',
            'businesses.*.business_name' => 'required|string|max:255',
            'businesses.*.category' => 'nullable|string|max:100',
            'businesses.*.email' => 'nullable|email|max:255',
            'businesses.*.phone' => 'nullable|string|max:50',
            'businesses.*.website' => 'nullable|url|max:500',
            'businesses.*.address' => 'nullable|string|max:500',
            'businesses.*.city' => 'nullable|string|max:100',
            'businesses.*.state' => 'nullable|string|max:50',
            'businesses.*.zip' => 'nullable|string|max:20',
            'businesses.*.google_rating' => 'nullable|numeric',
            'businesses.*.google_review_count' => 'nullable|integer',
            'businesses.*.enrichment_data' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $communityId = (string) (int) $request->input('community_id');
        $results = $this->ingestService->batchIngest($communityId, $request->input('businesses'));

        return response()->json([
            'message' => "Processed {$results['total']} businesses",
            'created' => $results['created'],
            'updated' => $results['updated'],
            'skipped' => $results['skipped'],
        ]);
    }

    public function enrichmentUpdate(Request $request, string $externalId): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'community_id' => 'required|integer|exists:communities,id',
            'enrichment_data' => 'required|array',
            'enrichment_data.website_pages' => 'nullable|array',
            'enrichment_data.has_events' => 'nullable|boolean',
            'enrichment_data.has_menu' => 'nullable|boolean',
            'enrichment_data.has_booking' => 'nullable|boolean',
            'enrichment_data.social_profiles' => 'nullable|array',
            'enrichment_data.employee_count_estimate' => 'nullable|integer',
            'enrichment_data.services_detected' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $validated = $validator->validated();
        $validated['community_id'] = (int) $validated['community_id'];

        $result = $this->ingestService->updateEnrichment($externalId, $validated);

        return response()->json([
            'message' => 'Enrichment data updated',
            'customer_id' => $result['customer_id'],
            'data_quality_score' => $result['data_quality_score'],
        ]);
    }
}
