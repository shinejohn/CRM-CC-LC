<?php

declare(strict_types=1);

namespace App\Http\Controllers\Pitch;

use App\Http\Controllers\Controller;
use App\Models\PitchSession;
use App\Services\Pitch\CampaignBundleValidator;
use App\Services\Pitch\PitchAnalyticsService;
use App\Services\Pitch\PitchEnrichmentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

final class PitchSessionController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'community_id' => ['required', 'integer', 'exists:communities,id'],
            'entry_platform' => ['required', 'string', 'max:80'],
            'entry_context' => ['nullable', 'string', 'max:500'],
            'org_type' => ['nullable', 'string', 'max:80'],
            'pitch_track' => ['nullable', 'string', 'max:80'],
            'status' => ['sometimes', 'string', 'max:50'],
            'last_step' => ['sometimes', 'string', 'max:120'],
        ]);

        $session = new PitchSession;
        $session->id = (string) Str::uuid();
        $session->community_id = $data['community_id'];
        $session->entry_platform = $data['entry_platform'];
        $session->entry_context = $data['entry_context'] ?? null;
        $session->org_type = $data['org_type'] ?? null;
        $session->pitch_track = $data['pitch_track'] ?? null;
        $session->status = $data['status'] ?? 'started';
        $session->last_step = $data['last_step'] ?? 'started';
        $session->last_active_at = now();
        $session->save();

        app(PitchAnalyticsService::class)->log($session->id, 'session_started', [
            'step' => $session->last_step,
        ]);

        return response()->json(['data' => $session->fresh()], 201);
    }

    public function show(string $id): JsonResponse
    {
        $session = PitchSession::query()
            ->with(['smb', 'customer', 'community', 'conversation', 'campaign'])
            ->findOrFail($id);

        return response()->json(['data' => $session]);
    }

    public function resume(string $id): JsonResponse
    {
        return $this->show($id);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $session = PitchSession::query()->findOrFail($id);

        $data = $request->validate([
            'status' => ['sometimes', 'string', 'max:50'],
            'last_step' => ['sometimes', 'string', 'max:120'],
            'org_type' => ['sometimes', 'nullable', 'string', 'max:80'],
            'pitch_track' => ['sometimes', 'nullable', 'string', 'max:80'],
            'discovery_answers' => ['sometimes', 'nullable', 'array'],
            'territory_selection' => ['sometimes', 'nullable', 'array'],
            'gates_offered' => ['sometimes', 'nullable', 'array'],
            'gates_completed' => ['sometimes', 'nullable', 'array'],
            'gates_deferred' => ['sometimes', 'nullable', 'array'],
            'products_accepted' => ['sometimes', 'nullable', 'array'],
            'products_declined' => ['sometimes', 'nullable', 'array'],
            'products_deferred' => ['sometimes', 'nullable', 'array'],
            'proposal_id' => ['sometimes', 'nullable', 'string', 'max:120'],
            'proposal_value' => ['sometimes', 'nullable', 'numeric'],
            'enrichment_event' => ['sometimes', 'nullable', 'string', 'max:80'],
            'enrichment_payload' => ['sometimes', 'nullable', 'array'],
        ]);

        $enrichmentEvent = $data['enrichment_event'] ?? null;
        $enrichmentPayload = $data['enrichment_payload'] ?? [];
        unset($data['enrichment_event'], $data['enrichment_payload']);

        $session->fill($data);
        $session->last_active_at = now();
        $session->save();

        if ($enrichmentEvent !== null && $enrichmentEvent !== '') {
            app(PitchEnrichmentService::class)->process($session->fresh(), $enrichmentEvent, $enrichmentPayload);
        }

        return response()->json(['data' => $session->fresh()->load(['smb', 'customer', 'community', 'conversation', 'campaign'])]);
    }

    public function event(Request $request, string $id): JsonResponse
    {
        $session = PitchSession::query()->findOrFail($id);

        $data = $request->validate([
            'event_type' => ['required', 'string', 'max:120'],
            'payload' => ['nullable', 'array'],
            'gate' => ['nullable', 'string', 'max:120'],
            'product' => ['nullable', 'string', 'max:120'],
        ]);

        $analytics = app(PitchAnalyticsService::class);
        $event = $analytics->log(
            $session->id,
            $data['event_type'],
            $data['payload'] ?? [],
            $data['gate'] ?? null,
            $data['product'] ?? null,
        );

        app(PitchEnrichmentService::class)->process($session->fresh(), $data['event_type'], $data['payload'] ?? []);

        $session->last_active_at = now();
        $session->save();

        return response()->json(['data' => ['pitch_event' => $event]], 201);
    }

    public function proposal(Request $request, string $id): JsonResponse
    {
        $session = PitchSession::query()->findOrFail($id);

        $data = $request->validate([
            'products' => ['required', 'array'],
            'products.*' => ['string', 'max:120'],
            'business_context' => ['nullable', 'array'],
            'proposal_id' => ['nullable', 'string', 'max:120'],
            'proposal_value' => ['nullable', 'numeric'],
            'total_mrr' => ['nullable', 'numeric'],
        ]);

        $validator = app(CampaignBundleValidator::class);
        $warnings = $validator->validate($data['products'], $data['business_context'] ?? []);

        $hasHardBlock = collect($warnings)->contains(fn (array $w) => ($w['type'] ?? '') === 'hard_block');
        if ($hasHardBlock) {
            throw ValidationException::withMessages([
                'products' => $warnings[0]['message'] ?? 'Proposal validation failed.',
            ]);
        }

        $value = $data['proposal_value'] ?? $data['total_mrr'] ?? null;
        $proposalId = $data['proposal_id'] ?? $session->proposal_id;

        $session->proposal_id = $proposalId;
        if ($value !== null) {
            $session->proposal_value = $value;
        }
        $session->status = 'proposed';
        $session->last_step = 'proposal_built';
        $session->last_active_at = now();
        $session->save();

        app(PitchEnrichmentService::class)->process($session->fresh(), 'proposal_presented', [
            'proposal_id' => $proposalId,
            'proposal_value' => $value,
            'total_mrr' => $value,
            'products' => $data['products'],
        ]);

        app(PitchAnalyticsService::class)->log($session->id, 'proposal_built', [
            'step' => 'proposal_built',
            'products' => $data['products'],
            'warnings' => $warnings,
        ]);

        return response()->json([
            'data' => [
                'session' => $session->fresh()->load(['smb', 'customer', 'community', 'campaign']),
                'warnings' => $warnings,
            ],
        ]);
    }
}
