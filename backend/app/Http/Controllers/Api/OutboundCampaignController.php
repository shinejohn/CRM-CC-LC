<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreOutboundCampaignRequest;
use App\Jobs\CampaignPreFlightJob;
use App\Models\CampaignRecipient;
use App\Models\CampaignVariant;
use App\Models\Customer;
use App\Models\OutboundCampaign;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

final class OutboundCampaignController extends Controller
{
    /**
     * List all outbound campaigns
     */
    public function index(Request $request): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');

        if (! $tenantId) {
            return response()->json(['error' => 'Tenant ID required'], 400);
        }

        $query = OutboundCampaign::where('tenant_id', $tenantId);

        // Filter by type
        if ($request->has('type')) {
            $query->where('type', $request->input('type'));
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->input('status'));
        }

        $perPage = $request->input('per_page', 20);
        $campaigns = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json([
            'data' => $campaigns->items(),
            'meta' => [
                'current_page' => $campaigns->currentPage(),
                'last_page' => $campaigns->lastPage(),
                'per_page' => $campaigns->perPage(),
                'total' => $campaigns->total(),
            ],
        ]);
    }

    /**
     * Get campaign details
     */
    public function show(Request $request, string $id): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');

        $campaign = OutboundCampaign::where('tenant_id', $tenantId)
            ->with('recipients.customer')
            ->findOrFail($id);

        return response()->json(['data' => $campaign]);
    }

    /**
     * Create new campaign
     */
    public function store(StoreOutboundCampaignRequest $request): JsonResponse
    {
        $tenantId = $request->getTenantId();

        if (! $tenantId) {
            return response()->json(['error' => 'Tenant ID required'], 400);
        }

        $validated = $request->validated();

        $variants = $validated['variants'] ?? [];
        $abEnabled = ! empty($variants) && (bool) ($validated['ab_test_enabled'] ?? true);

        $campaign = DB::transaction(function () use ($tenantId, $validated, $variants, $abEnabled) {
            $campaign = OutboundCampaign::create([
                'tenant_id' => $tenantId,
                'name' => $validated['name'],
                'type' => $validated['type'],
                'status' => $validated['scheduled_at'] ?? false ? 'scheduled' : 'draft',
                'subject' => $validated['subject'] ?? null,
                'message' => $validated['message'],
                'template_id' => $validated['template_id'] ?? null,
                'template_variables' => $validated['template_variables'] ?? [],
                'scheduled_at' => $validated['scheduled_at'] ?? null,
                'recipient_segments' => $validated['recipient_segments'] ?? [],
                'ab_test_enabled' => $abEnabled,
                'ab_winner_metric' => $abEnabled ? ($validated['ab_winner_metric'] ?? 'open_rate') : null,
                'ab_test_size' => $abEnabled ? ($validated['ab_test_size'] ?? null) : null,
            ]);

            if ($abEnabled) {
                $this->syncVariants($campaign, $variants);
            }

            return $campaign;
        });

        return response()->json([
            'data' => $campaign->load('variants'),
            'message' => 'Campaign created successfully',
        ], 201);
    }

    /**
     * Replace a campaign's variants with the supplied set.
     *
     * @param  array<int, array<string, mixed>>  $variants
     */
    private function syncVariants(OutboundCampaign $campaign, array $variants): void
    {
        $campaign->variants()->delete();

        $defaultLabels = ['A', 'B', 'C', 'D', 'E', 'F'];

        foreach (array_values($variants) as $index => $variant) {
            CampaignVariant::create([
                'outbound_campaign_id' => $campaign->id,
                'label' => $variant['label'] ?? ($defaultLabels[$index] ?? (string) ($index + 1)),
                'subject' => $variant['subject'] ?? null,
                'message' => $variant['message'] ?? null,
                'template_id' => $variant['template_id'] ?? null,
                'weight' => isset($variant['weight']) ? (int) $variant['weight'] : 50,
            ]);
        }
    }

    /**
     * Deterministically assign a recipient to a variant, honoring weights.
     *
     * Uses a stable hash of the recipient key mapped into [0,100) and walks the
     * cumulative weight buckets. Stable: the same key always lands in the same
     * variant, so re-runs are reproducible.
     *
     * @param  \Illuminate\Support\Collection<int, CampaignVariant>  $variants
     */
    private function assignVariant($variants, string $key): CampaignVariant
    {
        $totalWeight = (int) $variants->sum('weight');

        if ($totalWeight <= 0) {
            // No usable weights — fall back to a stable even split.
            $index = (int) (hexdec(substr(md5($key), 0, 8)) % $variants->count());

            return $variants->values()[$index];
        }

        // 0..(totalWeight-1) bucket from a stable hash.
        $bucket = (int) (hexdec(substr(md5($key), 0, 8)) % $totalWeight);

        $cumulative = 0;
        foreach ($variants as $variant) {
            $cumulative += (int) $variant->weight;
            if ($bucket < $cumulative) {
                return $variant;
            }
        }

        return $variants->last();
    }

    /**
     * Update campaign
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');

        $campaign = OutboundCampaign::where('tenant_id', $tenantId)->findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'message' => 'sometimes|string',
            'subject' => 'sometimes|string|max:255',
            'template_id' => 'nullable|uuid',
            'template_variables' => 'nullable|array',
            'scheduled_at' => 'nullable|date',
            'status' => 'sometimes|in:draft,scheduled,running,paused,completed,cancelled',
            'recipient_segments' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $campaign->update($request->only([
            'name', 'message', 'subject', 'template_id', 'template_variables',
            'scheduled_at', 'status', 'recipient_segments',
        ]));

        return response()->json([
            'data' => $campaign,
            'message' => 'Campaign updated successfully',
        ]);
    }

    /**
     * Delete campaign
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');

        $campaign = OutboundCampaign::where('tenant_id', $tenantId)->findOrFail($id);

        $campaign->delete();

        return response()->json(['message' => 'Campaign deleted successfully']);
    }

    /**
     * Hard cap on the number of recipients returned by the preview endpoint.
     * The real send path (start()) streams via chunkById and is not capped here.
     */
    private const RECIPIENT_PREVIEW_CAP = 1000;

    /**
     * Get campaign recipients based on segments
     */
    public function getRecipients(Request $request, string $id): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');

        $campaign = OutboundCampaign::where('tenant_id', $tenantId)->findOrFail($id);

        $segments = $campaign->recipient_segments ?? [];

        if ($this->segmentsAreEmpty($segments)) {
            return response()->json([
                'error' => 'At least one recipient segment is required. Refusing to target the entire customer table.',
            ], 422);
        }

        $query = $this->recipientQuery($tenantId, $campaign->type, $segments);

        // Full count without materializing 12.9M rows, plus a capped preview.
        $total = (clone $query)->count();
        $recipients = $this->buildRecipientList($query, $campaign->type, self::RECIPIENT_PREVIEW_CAP);

        return response()->json([
            'data' => [
                'total' => $total,
                'preview_count' => count($recipients),
                'preview_capped' => $total > self::RECIPIENT_PREVIEW_CAP,
                'recipients' => $recipients,
            ],
        ]);
    }

    /**
     * True when no usable segmentation filter is present. An empty segment set
     * would otherwise target the entire (12.9M row) customer table.
     */
    private function segmentsAreEmpty(array $segments): bool
    {
        foreach ($segments as $value) {
            if ($value !== null && $value !== '' && $value !== []) {
                return false;
            }
        }

        return true;
    }

    /**
     * Apply the mandatory email/SMS/phone health filter for the channel so we
     * never dispatch to opted-out, do-not-contact, suppressed, or contactless
     * customers — regardless of what the segments say.
     *
     * @param  \Illuminate\Database\Eloquent\Builder<Customer>  $query
     */
    private function applyHealthFilter($query, string $type): void
    {
        if ($type === 'email') {
            $query->where('email_opted_in', true)
                ->where('do_not_contact', false)
                ->where('email_suppressed', false)
                ->whereNotNull('email')
                ->where('email', '!=', '');

            return;
        }

        if ($type === 'sms') {
            $query->where('sms_opted_in', true)
                ->where('do_not_contact', false)
                ->whereNotNull('phone')
                ->where('phone', '!=', '');

            return;
        }

        if ($type === 'phone') {
            $query->where('phone_opted_in', true)
                ->where('do_not_contact', false)
                ->whereNotNull('phone')
                ->where('phone', '!=', '');
        }
    }

    /**
     * Build the filtered Customer query for a campaign's segments + channel
     * health filter. Returns a query builder so callers can count, cap, or
     * stream (chunkById) without loading everything into memory.
     *
     * @return \Illuminate\Database\Eloquent\Builder<Customer>
     */
    private function recipientQuery(string $tenantId, string $type, array $segments)
    {
        $query = Customer::where('tenant_id', $tenantId);

        // Apply segmentation filters
        if (isset($segments['state'])) {
            $query->where('state', strtoupper($segments['state']));
        }

        if (isset($segments['city'])) {
            $query->where('city', $segments['city']);
        }

        if (isset($segments['pipeline_stage'])) {
            $query->where('pipeline_stage', $segments['pipeline_stage']);
        }

        if (isset($segments['community_id'])) {
            $query->where('community_id', $segments['community_id']);
        }

        if (isset($segments['category'])) {
            $query->where(function ($q) use ($segments) {
                $cat = $segments['category'];
                $q->where('category', $cat)->orWhere('industry_category', $cat);
            });
        }

        if (isset($segments['campaign_status'])) {
            $query->where('campaign_status', $segments['campaign_status']);
        }

        if (isset($segments['profile_completeness_min'])) {
            $query->where('profile_completeness', '>=', $segments['profile_completeness_min']);
        }

        if (isset($segments['industry_category'])) {
            $query->where('industry_category', $segments['industry_category']);
        }

        if (isset($segments['industry_subcategory'])) {
            $query->where('industry_subcategory', $segments['industry_subcategory']);
        }

        if (isset($segments['lead_score_min'])) {
            $query->where('lead_score', '>=', $segments['lead_score_min']);
        }

        if (isset($segments['lead_score_max'])) {
            $query->where('lead_score', '<=', $segments['lead_score_max']);
        }

        if (isset($segments['tags']) && is_array($segments['tags'])) {
            foreach ($segments['tags'] as $tag) {
                $query->whereJsonContains('tags', $tag);
            }
        }

        if (isset($segments['has_email']) && $segments['has_email']) {
            $query->whereNotNull('email')->where('email', '!=', '');
        }

        if (isset($segments['has_phone']) && $segments['has_phone']) {
            $query->whereNotNull('phone')->where('phone', '!=', '');
        }

        // Mandatory channel health filter — always applied, never optional.
        $this->applyHealthFilter($query, $type);

        return $query;
    }

    /**
     * Materialize a capped preview array from a recipient query.
     *
     * @param  \Illuminate\Database\Eloquent\Builder<Customer>  $query
     * @return array<int, array<string, mixed>>
     */
    private function buildRecipientList($query, string $type, int $cap): array
    {
        $customers = (clone $query)
            ->select(['id', 'owner_name', 'business_name', 'email', 'phone'])
            ->limit($cap)
            ->get();

        $recipients = [];
        foreach ($customers as $customer) {
            $recipient = [
                'customer_id' => $customer->id,
                'name' => $customer->owner_name ?? $customer->business_name,
            ];

            if ($type === 'email' && $customer->email) {
                $recipient['email'] = $customer->email;
                $recipients[] = $recipient;
            } elseif (in_array($type, ['phone', 'sms'], true) && $customer->phone) {
                $recipient['phone'] = $customer->phone;
                $recipients[] = $recipient;
            }
        }

        return $recipients;
    }

    /**
     * Start campaign (queue all recipients)
     */
    public function start(Request $request, string $id): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');

        $campaign = OutboundCampaign::where('tenant_id', $tenantId)->findOrFail($id);

        if ($campaign->status !== 'draft' && $campaign->status !== 'scheduled') {
            return response()->json([
                'error' => 'Campaign can only be started from draft or scheduled status',
            ], 400);
        }

        $segments = $campaign->recipient_segments ?? [];

        if ($this->segmentsAreEmpty($segments)) {
            return response()->json([
                'error' => 'At least one recipient segment is required. Refusing to start a campaign targeting the entire customer table.',
            ], 422);
        }

        $query = $this->recipientQuery($tenantId, $campaign->type, $segments);

        // Resolve A/B variants once. Empty when the campaign has none — the
        // no-variant path assigns variant_id = null (unchanged behavior).
        $variants = $campaign->variants()->orderBy('created_at')->get();

        // Flip to running + kick off pre-flight in a short transaction. Recipient
        // creation and job dispatch happen OUTSIDE this transaction, chunked, so
        // we never hold a DB transaction open across hundreds of thousands of
        // inserts (the old code did the entire fan-out inside one transaction).
        DB::transaction(function () use ($campaign): void {
            $campaign->update([
                'status' => 'running',
                'started_at' => now(),
            ]);

            // For email campaigns, run pre-flight ZeroBounce validation. It may
            // set status='held' (>3% risk); the send path below and the send
            // jobs both respect that hold.
            if ($campaign->type === 'email') {
                CampaignPreFlightJob::dispatch($campaign);
            }
        });

        // Respect the pre-flight gate: if the campaign is (or becomes) held, we
        // still create the recipient rows but do NOT dispatch sends. A held
        // campaign's sends are released by the un-hold path, not here.
        $variantCounts = [];
        $total = 0;

        $query->select(['id', 'owner_name', 'business_name', 'email', 'phone'])
            ->chunkById(1000, function ($customers) use ($campaign, $tenantId, $variants, &$variantCounts, &$total): void {
                $dispatchSends = $campaign->fresh()?->status !== 'held';

                foreach ($customers as $customer) {
                    $isEmail = $campaign->type === 'email';
                    $contact = $isEmail ? $customer->email : $customer->phone;

                    if (! $contact) {
                        continue;
                    }

                    $variant = $variants->isNotEmpty()
                        ? $this->assignVariant($variants, (string) $customer->id)
                        : null;

                    if ($variant) {
                        $variantCounts[$variant->id] = ($variantCounts[$variant->id] ?? 0) + 1;
                    }

                    $recipient = CampaignRecipient::create([
                        'campaign_id' => $campaign->id,
                        'variant_id' => $variant?->id,
                        'customer_id' => $customer->id,
                        'tenant_id' => $tenantId,
                        'email' => $isEmail ? $customer->email : null,
                        'phone' => $isEmail ? null : $customer->phone,
                        'name' => $customer->owner_name ?? $customer->business_name,
                        'status' => 'pending',
                    ]);

                    $total++;

                    if ($dispatchSends) {
                        match ($campaign->type) {
                            'email' => \App\Jobs\SendEmailCampaign::dispatch($recipient, $campaign),
                            'phone' => \App\Jobs\MakePhoneCall::dispatch($recipient, $campaign),
                            'sms' => \App\Jobs\SendSMS::dispatch($recipient, $campaign),
                        };
                    }
                }
            }, 'id');

        // Persist per-variant recipient counts + campaign total.
        foreach ($variants as $variant) {
            $variant->update(['recipients_count' => (int) ($variantCounts[$variant->id] ?? 0)]);
        }

        $campaign->update(['total_recipients' => $total]);

        return response()->json([
            'data' => $campaign->fresh(),
            'message' => 'Campaign started successfully',
        ]);
    }

    /**
     * Get campaign analytics
     */
    public function analytics(Request $request, string $id): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');

        $campaign = OutboundCampaign::where('tenant_id', $tenantId)->findOrFail($id);

        $campaign->load('recipients');

        $recipients = $campaign->recipients;

        $statusCounts = $recipients->countBy('status')->toArray();

        $variants = $campaign->variants()->orderBy('created_at')->get();

        $variantStats = $variants->map(fn (CampaignVariant $v) => [
            'id' => $v->id,
            'label' => $v->label,
            'subject' => $v->subject,
            'weight' => $v->weight,
            'recipients_count' => $v->recipients_count,
            'sent_count' => $v->sent_count,
            'open_count' => $v->open_count,
            'click_count' => $v->click_count,
            'open_rate' => round($v->open_rate, 1),
            'click_rate' => round($v->click_rate, 1),
            'is_winner' => $v->is_winner,
        ])->values()->toArray();

        return response()->json([
            'data' => [
                'campaign_id' => $campaign->id,
                'total_recipients' => $campaign->total_recipients,
                'sent_count' => $campaign->sent_count,
                'delivered_count' => $campaign->delivered_count,
                'failed_count' => $campaign->failed_count,
                'opened_count' => $campaign->opened_count,
                'clicked_count' => $campaign->clicked_count,
                'replied_count' => $campaign->replied_count,
                'answered_count' => $campaign->answered_count,
                'voicemail_count' => $campaign->voicemail_count,
                'delivery_rate' => $campaign->delivery_rate,
                'open_rate' => $campaign->open_rate,
                'click_rate' => $campaign->click_rate,
                'status_breakdown' => $statusCounts,
                'ab_test_enabled' => (bool) $campaign->ab_test_enabled,
                'ab_winner_metric' => $campaign->ab_winner_metric,
                'variants' => $variantStats,
            ],
        ]);
    }

    /**
     * Pick the winning variant by the campaign's configured metric and mark it.
     */
    public function declareWinner(Request $request, string $id): JsonResponse
    {
        $tenantId = $request->header('X-Tenant-ID') ?? $request->input('tenant_id');

        $campaign = OutboundCampaign::where('tenant_id', $tenantId)->findOrFail($id);

        $variants = $campaign->variants()->get();

        if ($variants->isEmpty()) {
            return response()->json(['error' => 'Campaign has no variants'], 400);
        }

        $metric = $request->input('metric', $campaign->ab_winner_metric ?? 'open_rate');
        if (! in_array($metric, ['open_rate', 'click_rate'], true)) {
            $metric = 'open_rate';
        }

        // Highest rate wins; ties broken by raw count then sent volume.
        $winner = $variants->sort(function (CampaignVariant $a, CampaignVariant $b) use ($metric) {
            $cmp = $b->{$metric} <=> $a->{$metric};
            if ($cmp !== 0) {
                return $cmp;
            }
            $countKey = $metric === 'click_rate' ? 'click_count' : 'open_count';
            $cmp = $b->{$countKey} <=> $a->{$countKey};

            return $cmp !== 0 ? $cmp : ($b->sent_count <=> $a->sent_count);
        })->first();

        DB::transaction(function () use ($campaign, $winner) {
            $campaign->variants()->update(['is_winner' => false]);
            $winner->update(['is_winner' => true]);
        });

        return response()->json([
            'data' => $winner->fresh(),
            'message' => "Variant {$winner->label} declared winner",
        ]);
    }
}
