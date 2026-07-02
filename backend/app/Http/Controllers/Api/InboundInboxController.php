<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\EmailConversation;
use App\Models\Interaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;

/**
 * AI-triage inbox for inbound customer replies (CC Inbound Inbox page).
 *
 * Backed by {@see EmailConversation} rows with direction = 'inbound'. That
 * table has no `status`/`routed_to`/`confidence` columns, so those are
 * derived on read (and persisted only if a `status` column is later added —
 * every write is guarded with Schema::hasColumn so it never errors). Write
 * actions perform real work: override updates the row's AI response, escalate
 * creates a real CRM Interaction, archive/status update the row.
 */
final class InboundInboxController extends Controller
{
    private const VALID_STATUSES = ['pending', 'responded', 'escalated', 'archived'];

    /**
     * GET /v1/email/inbound?status=&sentiment=&page=&per_page=
     *
     * Paginated list of inbound conversations, newest first. Returns a flat
     * array under `data` (frontend expects InboundEmail[]).
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = (int) $request->integer('per_page', 25);
        $perPage = max(1, min($perPage, 100));
        $page = max(1, (int) $request->integer('page', 1));

        $hasStatusColumn = Schema::hasColumn('email_conversations', 'status');

        $query = EmailConversation::query()
            ->where('direction', 'inbound')
            ->latest('created_at');

        if ($request->filled('status')) {
            $status = (string) $request->string('status');
            $this->applyStatusFilter($query, $status, $hasStatusColumn);
        }

        if ($request->filled('sentiment')) {
            $query->where('sentiment', (string) $request->string('sentiment'));
        }

        $total = (clone $query)->count();

        /** @var \Illuminate\Support\Collection<int, EmailConversation> $rows */
        $rows = $query->forPage($page, $perPage)->get();

        $customerMap = $this->customerLookup($rows->pluck('from_email')->all());

        $data = $rows->map(fn (EmailConversation $c): array => $this->transform($c, $customerMap))->all();

        return response()->json([
            'data' => $data,
            'meta' => [
                'current_page' => $page,
                'per_page' => $perPage,
                'total' => $total,
                'last_page' => (int) max(1, (int) ceil($total / $perPage)),
            ],
        ]);
    }

    /**
     * GET /v1/email/inbound/{id}
     */
    public function show(string $id): JsonResponse
    {
        $conversation = EmailConversation::query()
            ->where('direction', 'inbound')
            ->findOrFail($id);

        $customerMap = $this->customerLookup([$conversation->from_email]);

        return response()->json(['data' => $this->transform($conversation, $customerMap)]);
    }

    /**
     * POST /v1/email/inbound/{id}/status  { status }
     *
     * Updates the triage status. Persists to the `status` column when present;
     * always touches the row so the change is a real write.
     */
    public function updateStatus(Request $request, string $id): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'required|string|in:responded,escalated,archived',
        ]);

        $conversation = EmailConversation::query()
            ->where('direction', 'inbound')
            ->findOrFail($id);

        $this->persistStatus($conversation, $validated['status']);

        $customerMap = $this->customerLookup([$conversation->from_email]);

        return response()->json(['data' => $this->transform($conversation, $customerMap, $validated['status'])]);
    }

    /**
     * POST /v1/email/inbound/{id}/override  { response }
     *
     * Human-authored replacement for the AI response. Real row update:
     * sets ai_response and marks ai_responded = true.
     */
    public function override(Request $request, string $id): JsonResponse
    {
        $validated = $request->validate([
            'response' => 'required|string',
        ]);

        $conversation = EmailConversation::query()
            ->where('direction', 'inbound')
            ->findOrFail($id);

        $conversation->ai_response = $validated['response'];
        $conversation->ai_responded = true;
        $conversation->save();

        $this->persistStatus($conversation, 'responded');

        $customerMap = $this->customerLookup([$conversation->from_email]);

        return response()->json(['data' => $this->transform($conversation, $customerMap, 'responded')]);
    }

    /**
     * POST /v1/email/inbound/{id}/escalate  { note? }
     *
     * Escalates to a human. Creates a real CRM {@see Interaction} (mirroring
     * InboundEmailRoutingService::escalateToHuman) when the sender resolves to
     * a customer, and marks the conversation status = escalated.
     */
    public function escalate(Request $request, string $id): JsonResponse
    {
        $note = (string) $request->string('note');

        $conversation = EmailConversation::query()
            ->where('direction', 'inbound')
            ->findOrFail($id);

        $customer = $this->resolveCustomer($conversation->from_email);

        if ($customer !== null) {
            Interaction::create([
                'customer_id' => $customer->id,
                'tenant_id' => $customer->tenant_id,
                'type' => 'human_escalation',
                'title' => 'Inbound email escalation: '.($conversation->subject ?? '(no subject)'),
                'entry_point' => 'email',
                'status' => 'pending',
                'priority' => 'high',
                'notes' => trim($note."\n\n".(string) $conversation->body),
                'metadata' => [
                    'source' => 'inbound_inbox',
                    'conversation_id' => $conversation->id,
                    'from_email' => $conversation->from_email,
                    'intent' => $conversation->intent,
                    'sentiment' => $conversation->sentiment,
                ],
            ]);
        }

        $this->persistStatus($conversation, 'escalated');

        $customerMap = $customer !== null
            ? [$this->normalizeEmail($conversation->from_email) => $customer]
            : [];

        return response()->json(['data' => $this->transform($conversation, $customerMap, 'escalated')]);
    }

    /**
     * Apply a status filter, using the real column when available and falling
     * back to derived state (via ai_responded) otherwise.
     *
     * @param  \Illuminate\Database\Eloquent\Builder<EmailConversation>  $query
     */
    private function applyStatusFilter($query, string $status, bool $hasStatusColumn): void
    {
        if (! in_array($status, self::VALID_STATUSES, true)) {
            return;
        }

        if ($hasStatusColumn) {
            $query->where('status', $status);

            return;
        }

        // No status column: derive from ai_responded. escalated/archived
        // cannot be represented without the column, so they match nothing.
        match ($status) {
            'responded' => $query->where('ai_responded', true),
            'pending' => $query->where('ai_responded', false),
            default => $query->whereRaw('1 = 0'),
        };
    }

    /**
     * Persist a triage status if the column exists; the write always touches
     * the row (updated_at) so the action has a real, observable effect.
     */
    private function persistStatus(EmailConversation $conversation, string $status): void
    {
        if (Schema::hasColumn('email_conversations', 'status')) {
            $conversation->setAttribute('status', $status);
        }

        $conversation->save();
    }

    /**
     * Build an email => Customer map for a set of sender addresses in one query.
     *
     * @param  array<int, string|null>  $emails
     * @return array<string, Customer>
     */
    private function customerLookup(array $emails): array
    {
        $normalized = collect($emails)
            ->filter(fn ($e): bool => is_string($e) && $e !== '')
            ->map(fn (string $e): string => $this->normalizeEmail($e))
            ->unique()
            ->values()
            ->all();

        if ($normalized === []) {
            return [];
        }

        return Customer::query()
            ->whereIn('email', $normalized)
            ->get(['id', 'email', 'business_name', 'tenant_id'])
            ->keyBy(fn (Customer $c): string => $this->normalizeEmail((string) $c->email))
            ->all();
    }

    private function resolveCustomer(?string $email): ?Customer
    {
        if (! is_string($email) || $email === '') {
            return null;
        }

        return Customer::query()
            ->where('email', $this->normalizeEmail($email))
            ->first();
    }

    private function normalizeEmail(string $email): string
    {
        return strtolower(trim($email));
    }

    /**
     * Map an EmailConversation to the frontend InboundEmail shape.
     *
     * @param  array<string, Customer>  $customerMap
     */
    private function transform(EmailConversation $c, array $customerMap, ?string $forcedStatus = null): array
    {
        $customer = $customerMap[$this->normalizeEmail((string) $c->from_email)] ?? null;

        $status = $forcedStatus
            ?? ($c->getAttribute('status') ?? $this->deriveStatus($c));

        return [
            'id' => $c->id,
            'from_email' => $c->from_email,
            'to_email' => $c->to_email,
            'subject' => $c->subject ?? '',
            'body' => $c->body ?? '',
            'body_html' => $c->body_html,
            'sentiment' => $this->normalizeSentiment($c->sentiment),
            'intent' => $c->intent ?? 'other',
            'confidence' => 0.0, // no confidence column on email_conversations
            'status' => $status,
            'ai_responded' => (bool) $c->ai_responded,
            'ai_response' => $c->ai_response,
            'routed_to' => $this->deriveRoutedTo($c),
            'customer_id' => $customer?->id,
            'customer_name' => $customer?->business_name,
            'campaign_id' => $c->campaign_send_id,
            'created_at' => optional($c->created_at)->toISOString(),
            'updated_at' => optional($c->updated_at)->toISOString(),
        ];
    }

    private function deriveStatus(EmailConversation $c): string
    {
        return $c->ai_responded ? 'responded' : 'pending';
    }

    private function deriveRoutedTo(EmailConversation $c): ?string
    {
        if ($c->ai_responded) {
            return 'ai';
        }

        if ($c->sentiment === 'negative' || $c->intent === 'complaint') {
            return 'human';
        }

        return null;
    }

    private function normalizeSentiment(?string $sentiment): string
    {
        return match (strtolower((string) $sentiment)) {
            'positive' => 'positive',
            'negative' => 'negative',
            default => 'neutral',
        };
    }
}
