<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ImplementationStage;
use App\Models\SlaPolicy;
use App\Models\Ticket;
use App\Models\TicketNote;
use App\Models\TicketStatusHistory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

final class TicketController extends Controller
{
    // ── Default implementation stages ────────────────────────────────────────

    private const IMPLEMENTATION_STAGES = [
        ['stage_name' => 'Contract Signed',    'stage_order' => 1],
        ['stage_name' => 'Channel Setup',       'stage_order' => 2],
        ['stage_name' => 'Content Approval',    'stage_order' => 3],
        ['stage_name' => 'First Distribution',  'stage_order' => 4],
        ['stage_name' => 'QA',                  'stage_order' => 5],
        ['stage_name' => 'Live',                'stage_order' => 6],
    ];

    // ── Queue / list ──────────────────────────────────────────────────────────

    public function index(Request $request): JsonResponse
    {
        $query = Ticket::query()
            ->with(['client:id,business_name', 'community:id,name', 'slaPolicy:id,first_response_hrs,resolution_hrs'])
            ->latest();

        if ($request->filled('type')) {
            $query->where('type', $request->input('type'));
        }

        if ($request->filled('status')) {
            $statuses = is_array($request->input('status'))
                ? $request->input('status')
                : explode(',', (string) $request->input('status'));
            $query->whereIn('status', $statuses);
        }

        if ($request->filled('priority')) {
            $query->where('priority', $request->input('priority'));
        }

        if ($request->filled('app')) {
            $query->where('app', $request->input('app'));
        }

        if ($request->filled('assigned_to')) {
            $query->where('assigned_to', $request->input('assigned_to'));
        }

        if ($request->filled('community_id')) {
            $query->where('community_id', $request->input('community_id'));
        }

        if ($request->filled('client_id')) {
            $query->where('client_id', $request->input('client_id'));
        }

        if ($request->filled('search')) {
            $term = '%' . $request->input('search') . '%';
            $query->where(function ($q) use ($term) {
                $q->whereRaw('LOWER(subject) LIKE LOWER(?)', [$term])
                  ->orWhereRaw('LOWER(ticket_number) LIKE LOWER(?)', [$term]);
            });
        }

        if ($request->filled('due_before')) {
            $query->where('due_at', '<=', $request->input('due_before'));
        }

        if ($request->boolean('overdue')) {
            $query->whereNotNull('due_at')
                  ->where('due_at', '<', now())
                  ->whereNotIn('status', ['resolved', 'closed', 'cancelled']);
        }

        // Named views
        $view = $request->input('view');
        if ($view === 'my_open' && Auth::id()) {
            $query->where('assigned_to', Auth::id())
                  ->whereNotIn('status', ['resolved', 'closed', 'cancelled']);
        } elseif ($view === 'unassigned') {
            $query->whereNull('assigned_to')
                  ->whereNotIn('status', ['resolved', 'closed', 'cancelled']);
        } elseif ($view === 'escalated') {
            $query->where('status', 'escalated');
        } elseif ($view === 'due_today') {
            $query->whereDate('due_at', today());
        } elseif ($view === 'all_open') {
            $query->whereNotIn('status', ['resolved', 'closed', 'cancelled']);
        }

        $sort = $request->input('sort', 'created_at');
        $dir  = $request->input('direction', 'desc');
        $allowedSorts = ['created_at', 'updated_at', 'due_at', 'priority'];
        if (in_array($sort, $allowedSorts, true)) {
            $query->orderBy($sort, $dir === 'asc' ? 'asc' : 'desc');
        }

        $perPage = min((int) $request->input('per_page', 25), 100);
        $tickets = $query->paginate($perPage);

        return response()->json($tickets);
    }

    // ── Create ────────────────────────────────────────────────────────────────

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'type'         => ['required', Rule::in(['support', 'implementation', 'sales'])],
            'priority'     => ['sometimes', Rule::in(['low', 'normal', 'high', 'critical'])],
            'subject'      => ['required', 'string', 'max:255'],
            'description'  => ['nullable', 'string'],
            'client_id'    => ['nullable', 'uuid', 'exists:smbs,id'],
            'contact_id'   => ['nullable', 'uuid', 'exists:customers,id'],
            'community_id' => ['nullable', 'uuid', 'exists:communities,id'],
            'channel'      => ['nullable', 'string', 'max:50'],
            'app'          => ['nullable', 'string', 'max:50'],
            'source'       => ['nullable', Rule::in(['email', 'social_monitor', 'manual', 'reader_form', 'internal'])],
            'assigned_to'  => ['nullable', 'uuid'],
            'external_ref' => ['nullable', 'string'],
            'tags'         => ['nullable', 'array'],
        ]);

        $data['created_by'] = Auth::id();
        $data['status']     = 'new';
        $data['priority']   = $data['priority'] ?? 'normal';
        $data['source']     = $data['source'] ?? 'manual';

        $ticket = Ticket::create($data);

        // Assign SLA policy and compute due_at
        $this->assignSla($ticket);

        // Auto-create implementation stages
        if ($ticket->type === 'implementation') {
            foreach (self::IMPLEMENTATION_STAGES as $stage) {
                ImplementationStage::create(array_merge($stage, ['ticket_id' => $ticket->id, 'status' => 'pending']));
            }
        }

        // Record initial status history
        TicketStatusHistory::create([
            'ticket_id'  => $ticket->id,
            'from_status' => null,
            'to_status'  => $ticket->status,
            'changed_by' => Auth::id(),
            'changed_at' => now(),
        ]);

        return response()->json($ticket->load(['implementationStages', 'slaPolicy']), 201);
    }

    // ── Show ──────────────────────────────────────────────────────────────────

    public function show(string $id): JsonResponse
    {
        $ticket = Ticket::with([
            'client:id,business_name,primary_email,primary_phone,subscription_tier',
            'contact:id,first_name,last_name,email',
            'community:id,name,state',
            'slaPolicy',
            'notes',
            'attachments',
            'statusHistory',
            'implementationStages',
        ])->findOrFail($id);

        return response()->json($ticket);
    }

    // ── Update ────────────────────────────────────────────────────────────────

    public function update(Request $request, string $id): JsonResponse
    {
        $ticket = Ticket::findOrFail($id);

        $data = $request->validate([
            'status'       => ['sometimes', Rule::in(['new', 'open', 'pending', 'in_progress', 'escalated', 'resolved', 'closed', 'cancelled'])],
            'priority'     => ['sometimes', Rule::in(['low', 'normal', 'high', 'critical'])],
            'subject'      => ['sometimes', 'string', 'max:255'],
            'description'  => ['sometimes', 'nullable', 'string'],
            'assigned_to'  => ['sometimes', 'nullable', 'uuid'],
            'community_id' => ['sometimes', 'nullable', 'uuid', 'exists:communities,id'],
            'channel'      => ['sometimes', 'nullable', 'string', 'max:50'],
            'app'          => ['sometimes', 'nullable', 'string', 'max:50'],
            'tags'         => ['sometimes', 'array'],
            'due_at'       => ['sometimes', 'nullable', 'date'],
        ]);

        $previousStatus = $ticket->status;

        // Track status change
        if (isset($data['status']) && $data['status'] !== $previousStatus) {
            TicketStatusHistory::create([
                'ticket_id'   => $ticket->id,
                'from_status' => $previousStatus,
                'to_status'   => $data['status'],
                'changed_by'  => Auth::id(),
                'changed_at'  => now(),
                'reason'      => $request->input('status_reason'),
            ]);

            if (in_array($data['status'], ['resolved', 'closed'], true) && $ticket->resolved_at === null) {
                $data['resolved_at'] = now();
            }
        }

        $ticket->update($data);

        return response()->json($ticket->fresh(['slaPolicy']));
    }

    // ── Destroy ───────────────────────────────────────────────────────────────

    public function destroy(string $id): JsonResponse
    {
        Ticket::findOrFail($id)->delete();

        return response()->json(['message' => 'Ticket deleted.']);
    }

    // ── Notes ─────────────────────────────────────────────────────────────────

    public function addNote(Request $request, string $id): JsonResponse
    {
        $ticket = Ticket::findOrFail($id);

        $data = $request->validate([
            'body'        => ['required', 'string'],
            'is_internal' => ['boolean'],
        ]);

        $note = TicketNote::create([
            'ticket_id'   => $ticket->id,
            'author_id'   => Auth::id(),
            'body'        => $data['body'],
            'is_internal' => $data['is_internal'] ?? true,
        ]);

        // Mark first_responded_at if this is a client-facing note
        if (! $note->is_internal && $ticket->first_responded_at === null) {
            $ticket->update(['first_responded_at' => now()]);
        }

        // Open ticket when first note is added to a 'new' ticket
        if ($ticket->status === 'new') {
            $previousStatus = $ticket->status;
            $ticket->update(['status' => 'open']);
            TicketStatusHistory::create([
                'ticket_id'   => $ticket->id,
                'from_status' => $previousStatus,
                'to_status'   => 'open',
                'changed_by'  => Auth::id(),
                'changed_at'  => now(),
            ]);
        }

        return response()->json($note, 201);
    }

    // ── Bulk actions ──────────────────────────────────────────────────────────

    public function bulkUpdate(Request $request): JsonResponse
    {
        $data = $request->validate([
            'ids'         => ['required', 'array', 'min:1'],
            'ids.*'       => ['uuid'],
            'status'      => ['sometimes', Rule::in(['new', 'open', 'pending', 'in_progress', 'escalated', 'resolved', 'closed', 'cancelled'])],
            'priority'    => ['sometimes', Rule::in(['low', 'normal', 'high', 'critical'])],
            'assigned_to' => ['sometimes', 'nullable', 'uuid'],
            'tags_add'    => ['sometimes', 'array'],
        ]);

        $ids     = $data['ids'];
        $updates = array_filter([
            'status'      => $data['status'] ?? null,
            'priority'    => $data['priority'] ?? null,
            'assigned_to' => $data['assigned_to'] ?? null,
        ]);

        if (! empty($updates)) {
            Ticket::whereIn('id', $ids)->update($updates);
        }

        return response()->json(['updated' => count($ids)]);
    }

    // ── SLA assignment ────────────────────────────────────────────────────────

    private function assignSla(Ticket $ticket): void
    {
        $policy = SlaPolicy::forTicket($ticket->type, $ticket->priority);

        if ($policy === null) {
            return;
        }

        $ticket->update([
            'sla_policy_id' => $policy->id,
            'due_at'        => $ticket->created_at->addHours($policy->resolution_hrs),
        ]);
    }
}
