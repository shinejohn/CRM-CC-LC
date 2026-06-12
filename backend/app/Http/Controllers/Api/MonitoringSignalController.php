<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MonitoringSignal;
use App\Models\Ticket;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

final class MonitoringSignalController extends Controller
{
    // ── Ingest (called by monitoring agent / OpenClaw webhook) ────────────────

    public function ingest(Request $request): JsonResponse
    {
        $data = $request->validate([
            'source_platform' => ['required', 'string', 'max:50'],
            'community_id'    => ['nullable', 'uuid', 'exists:communities,id'],
            'raw_content'     => ['required', 'string'],
            'signal_type'     => ['required', Rule::in(['complaint', 'bug_report', 'content_error', 'positive', 'spam', 'other'])],
            'url'             => ['nullable', 'string'],
        ]);

        $signal = MonitoringSignal::create(array_merge($data, ['detected_at' => now()]));

        // Auto-create ticket for actionable signal types
        if ($signal->shouldAutoCreateTicket()) {
            $ticket = Ticket::create([
                'type'         => 'support',
                'status'       => 'new',
                'priority'     => $signal->signal_type === 'complaint' ? 'high' : 'normal',
                'subject'      => ucfirst(str_replace('_', ' ', $signal->signal_type)) . ' via ' . $signal->source_platform,
                'description'  => $signal->raw_content,
                'community_id' => $signal->community_id,
                'channel'      => $signal->source_platform,
                'source'       => 'social_monitor',
                'external_ref' => $signal->url,
            ]);

            $signal->update([
                'ticket_id'   => $ticket->id,
                'auto_created' => true,
            ]);
        }

        return response()->json($signal->fresh(), 201);
    }

    // ── Staff review queue (pending signals without a ticket) ─────────────────

    public function index(Request $request): JsonResponse
    {
        $query = MonitoringSignal::with('community:id,name')
            ->latest('detected_at');

        if ($request->filled('signal_type')) {
            $query->where('signal_type', $request->input('signal_type'));
        }

        if ($request->filled('source_platform')) {
            $query->where('source_platform', $request->input('source_platform'));
        }

        if ($request->filled('community_id')) {
            $query->where('community_id', $request->input('community_id'));
        }

        if ($request->boolean('unreviewed')) {
            $query->whereNull('reviewed_at')->whereNull('ticket_id');
        }

        $perPage = min((int) $request->input('per_page', 25), 100);

        return response()->json($query->paginate($perPage));
    }

    // ── Promote signal to ticket (one-click) ─────────────────────────────────

    public function promote(Request $request, string $id): JsonResponse
    {
        $signal = MonitoringSignal::findOrFail($id);

        abort_if($signal->ticket_id !== null, 422, 'Signal already has a ticket.');

        $data = $request->validate([
            'subject'  => ['sometimes', 'string', 'max:255'],
            'priority' => ['sometimes', Rule::in(['low', 'normal', 'high', 'critical'])],
        ]);

        $ticket = Ticket::create([
            'type'         => 'support',
            'status'       => 'new',
            'priority'     => $data['priority'] ?? 'normal',
            'subject'      => $data['subject'] ?? ucfirst(str_replace('_', ' ', $signal->signal_type)) . ' via ' . $signal->source_platform,
            'description'  => $signal->raw_content,
            'community_id' => $signal->community_id,
            'channel'      => $signal->source_platform,
            'source'       => 'social_monitor',
            'external_ref' => $signal->url,
            'created_by'   => Auth::id(),
        ]);

        $signal->update([
            'ticket_id'   => $ticket->id,
            'auto_created' => false,
            'reviewed_by'  => Auth::id(),
            'reviewed_at'  => now(),
        ]);

        return response()->json($ticket, 201);
    }

    // ── Mark reviewed (dismiss without creating ticket) ───────────────────────

    public function dismiss(string $id): JsonResponse
    {
        $signal = MonitoringSignal::findOrFail($id);

        $signal->update([
            'reviewed_by' => Auth::id(),
            'reviewed_at' => now(),
        ]);

        return response()->json(['message' => 'Signal dismissed.']);
    }
}
