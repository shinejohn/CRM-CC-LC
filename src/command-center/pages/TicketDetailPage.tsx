import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft, AlertTriangle, Clock, CheckCircle2,
  MessageSquare, Lock, Globe, ChevronRight,
  Building2, User, Circle,
} from 'lucide-react';
import { ticketService } from '@/services/ticketService';
import type { TicketStatus, TicketPriority, ImplementationStage, StageStatus } from '@/types/tickets';

const PRIORITY_COLORS: Record<TicketPriority, string> = {
  critical: 'text-red-500 bg-red-500/10 border border-red-500/20',
  high:     'text-orange-500 bg-orange-500/10 border border-orange-500/20',
  normal:   'text-blue-500 bg-blue-500/10 border border-blue-500/20',
  low:      'text-[var(--nexus-text-tertiary)] bg-[var(--nexus-bg-secondary)] border border-[var(--nexus-divider)]',
};

const STATUS_OPTIONS: TicketStatus[] = [
  'new', 'open', 'pending', 'in_progress', 'escalated', 'resolved', 'closed', 'cancelled',
];

const STAGE_STATUS_COLORS: Record<StageStatus, string> = {
  pending:     'text-[var(--nexus-text-tertiary)]',
  in_progress: 'text-yellow-500',
  complete:    'text-green-500',
  blocked:     'text-red-500',
};

function SlaCountdown({ dueAt, createdAt }: { dueAt: string; createdAt: string }) {
  const due     = new Date(dueAt).getTime();
  const created = new Date(createdAt).getTime();
  const now     = Date.now();
  const total   = due - created;
  const pct     = total > 0 ? Math.min(100, ((now - created) / total) * 100) : 100;
  const msLeft  = due - now;
  const hoursLeft = Math.max(0, Math.round(msLeft / 3_600_000));
  const overdue   = msLeft < 0;

  const barColor = overdue ? 'bg-red-500' : pct >= 80 ? 'bg-orange-500' : 'bg-green-500';

  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-[var(--nexus-text-tertiary)]">SLA</span>
        <span className={overdue ? 'text-red-500 font-semibold' : 'text-[var(--nexus-text-secondary)]'}>
          {overdue ? `Overdue by ${Math.abs(hoursLeft)}h` : `${hoursLeft}h remaining`}
        </span>
      </div>
      <div className="w-full h-2 rounded-full bg-[var(--nexus-bg-secondary)]">
        <div className={`h-2 rounded-full transition-all ${barColor}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function ImplementationTracker({
  stages,
  ticketId,
}: {
  stages: ImplementationStage[];
  ticketId: string;
}) {
  const queryClient = useQueryClient();

  const updateStage = useMutation({
    mutationFn: ({ stageId, status }: { stageId: string; status: StageStatus }) =>
      ticketService.updateStage(ticketId, stageId, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] }),
  });

  const complete = stages.filter((s) => s.status === 'complete').length;
  const pct      = stages.length > 0 ? Math.round((complete / stages.length) * 100) : 0;

  return (
    <div className="space-y-3">
      {/* Progress bar */}
      <div>
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-[var(--nexus-text-tertiary)]">Progress</span>
          <span className="text-[var(--nexus-text-secondary)]">{complete}/{stages.length} stages complete</span>
        </div>
        <div className="w-full h-2 rounded-full bg-[var(--nexus-bg-secondary)]">
          <div
            className="h-2 rounded-full bg-[var(--nexus-accent-primary)] transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Stage list */}
      <div className="space-y-1">
        {stages.map((stage, idx) => {
          const isActive = stage.status === 'in_progress';
          const isDone   = stage.status === 'complete';

          return (
            <div
              key={stage.id}
              className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                isActive ? 'bg-[var(--nexus-accent-primary)]/5' : 'hover:bg-[var(--nexus-bg-secondary)]'
              }`}
            >
              <div className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center text-xs font-bold ${
                isDone
                  ? 'border-green-500 bg-green-500 text-white'
                  : isActive
                  ? 'border-[var(--nexus-accent-primary)] text-[var(--nexus-accent-primary)]'
                  : stage.status === 'blocked'
                  ? 'border-red-500 text-red-500'
                  : 'border-[var(--nexus-divider)] text-[var(--nexus-text-tertiary)]'
              }`}>
                {isDone ? '✓' : idx + 1}
              </div>

              <div className="flex-1 min-w-0">
                <div className={`text-sm font-medium truncate ${
                  isDone ? 'text-[var(--nexus-text-tertiary)] line-through' : 'text-[var(--nexus-text-primary)]'
                }`}>
                  {stage.stage_name}
                </div>
                <div className={`text-xs capitalize ${STAGE_STATUS_COLORS[stage.status]}`}>
                  {stage.status.replace('_', ' ')}
                </div>
              </div>

              <select
                value={stage.status}
                onChange={(e) =>
                  updateStage.mutate({ stageId: stage.id, status: e.target.value as StageStatus })
                }
                onClick={(e) => e.stopPropagation()}
                className="text-xs bg-[var(--nexus-bg-secondary)] border border-[var(--nexus-divider)] rounded px-1 py-0.5 text-[var(--nexus-text-secondary)]"
                aria-label={`Stage status for ${stage.stage_name}`}
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="complete">Complete</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function TicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [noteBody, setNoteBody]       = useState('');
  const [isInternal, setIsInternal]   = useState(true);
  const [statusReason, setStatusReason] = useState('');

  const { data: ticket, isLoading } = useQuery({
    queryKey: ['ticket', id],
    queryFn: () => ticketService.get(id!),
    enabled: !!id,
  });

  const updateTicket = useMutation({
    mutationFn: (data: Parameters<typeof ticketService.update>[1]) =>
      ticketService.update(id!, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ticket', id] }),
  });

  const addNote = useMutation({
    mutationFn: () => ticketService.addNote(id!, noteBody, isInternal),
    onSuccess: () => {
      setNoteBody('');
      queryClient.invalidateQueries({ queryKey: ['ticket', id] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="w-6 h-6 border-2 border-[var(--nexus-accent-primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="p-8 text-center text-[var(--nexus-text-secondary)]">Ticket not found.</div>
    );
  }

  const allThread = [
    ...(ticket.notes ?? []).map((n) => ({ ...n, _kind: 'note' as const })),
    ...(ticket.status_history ?? []).map((s) => ({ ...s, _kind: 'status' as const })),
  ].sort((a, b) => {
    const aDate = 'created_at' in a ? a.created_at : (a as { changed_at: string }).changed_at;
    const bDate = 'created_at' in b ? b.created_at : (b as { changed_at: string }).changed_at;
    return new Date(aDate).getTime() - new Date(bDate).getTime();
  });

  return (
    <div className="h-full flex flex-col bg-[var(--nexus-bg-primary)]">
      {/* Header */}
      <div className="flex items-center gap-4 px-6 py-4 border-b border-[var(--nexus-divider)]">
        <button
          type="button"
          onClick={() => navigate('/command-center/support')}
          className="text-[var(--nexus-text-tertiary)] hover:text-[var(--nexus-text-primary)] transition-colors"
          aria-label="Back to queue"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className="font-mono text-sm text-[var(--nexus-text-tertiary)]">{ticket.ticket_number}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full capitalize font-medium ${PRIORITY_COLORS[ticket.priority]}`}>
            {ticket.priority}
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--nexus-bg-secondary)] text-[var(--nexus-text-secondary)] capitalize">
            {ticket.type}
          </span>
          <h1 className="text-base font-semibold text-[var(--nexus-text-primary)] truncate flex-1">
            {ticket.subject}
          </h1>
        </div>
        {/* Status selector */}
        <select
          value={ticket.status}
          onChange={(e) => updateTicket.mutate({ status: e.target.value as TicketStatus })}
          className="bg-[var(--nexus-bg-secondary)] border border-[var(--nexus-divider)] rounded-lg px-3 py-1.5 text-sm text-[var(--nexus-text-primary)]"
          aria-label="Ticket status"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s.replace('_', ' ')}</option>
          ))}
        </select>
      </div>

      {/* Body: thread + sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Thread */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* SLA bar if applicable */}
          {ticket.due_at && (
            <div className="px-6 py-3 border-b border-[var(--nexus-divider)]">
              <SlaCountdown dueAt={ticket.due_at} createdAt={ticket.created_at} />
            </div>
          )}

          {/* Implementation stages */}
          {ticket.type === 'implementation' && ticket.implementation_stages && (
            <div className="px-6 py-4 border-b border-[var(--nexus-divider)]">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-[var(--nexus-text-tertiary)] mb-3">
                Implementation Progress
              </h2>
              <ImplementationTracker
                stages={ticket.implementation_stages}
                ticketId={ticket.id}
              />
            </div>
          )}

          {/* Thread */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {ticket.description && (
              <div className="p-4 rounded-lg bg-[var(--nexus-bg-secondary)] border border-[var(--nexus-divider)]">
                <div className="text-xs text-[var(--nexus-text-tertiary)] mb-1">
                  Description · {new Date(ticket.created_at).toLocaleString()}
                </div>
                <p className="text-sm text-[var(--nexus-text-primary)] whitespace-pre-wrap">{ticket.description}</p>
              </div>
            )}

            {allThread.map((item) => {
              if (item._kind === 'status') {
                const si = item as typeof item & { from_status: string | null; to_status: string; changed_at: string };
                return (
                  <div key={si.id} className="flex items-center gap-2 text-xs text-[var(--nexus-text-tertiary)]">
                    <div className="h-px flex-1 bg-[var(--nexus-divider)]" />
                    <span>
                      Status changed
                      {si.from_status ? ` from ${si.from_status.replace('_', ' ')}` : ''}
                      {' → '}{si.to_status.replace('_', ' ')}
                      {' · '}{new Date(si.changed_at).toLocaleString()}
                    </span>
                    <div className="h-px flex-1 bg-[var(--nexus-divider)]" />
                  </div>
                );
              }

              const note = item as typeof item & { body: string; is_internal: boolean; created_at: string };
              return (
                <div
                  key={note.id}
                  className={`p-4 rounded-lg border ${
                    note.is_internal
                      ? 'bg-yellow-500/5 border-yellow-500/20'
                      : 'bg-[var(--nexus-bg-secondary)] border-[var(--nexus-divider)]'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1 text-xs text-[var(--nexus-text-tertiary)]">
                    {note.is_internal ? (
                      <><Lock className="w-3 h-3" /><span>Internal note</span></>
                    ) : (
                      <><Globe className="w-3 h-3" /><span>Client-facing</span></>
                    )}
                    <span>· {new Date(note.created_at).toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-[var(--nexus-text-primary)] whitespace-pre-wrap">{note.body}</p>
                </div>
              );
            })}
          </div>

          {/* Add note */}
          <div className="px-6 py-4 border-t border-[var(--nexus-divider)]">
            <textarea
              rows={3}
              value={noteBody}
              onChange={(e) => setNoteBody(e.target.value)}
              placeholder="Add a note…"
              className="w-full bg-[var(--nexus-bg-secondary)] border border-[var(--nexus-divider)] rounded-lg px-3 py-2 text-sm text-[var(--nexus-text-primary)] placeholder:text-[var(--nexus-text-tertiary)] resize-none focus:outline-none focus:border-[var(--nexus-accent-primary)]"
            />
            <div className="flex items-center justify-between mt-2">
              <label className="flex items-center gap-2 text-xs text-[var(--nexus-text-secondary)] cursor-pointer">
                <input
                  type="checkbox"
                  role="switch"
                  checked={isInternal}
                  onChange={(e) => setIsInternal(e.target.checked)}
                  aria-checked={isInternal}
                  aria-label="Internal note (not visible to client)"
                  className="rounded"
                />
                Internal note
              </label>
              <button
                type="button"
                disabled={!noteBody.trim() || addNote.isPending}
                onClick={() => addNote.mutate()}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-[var(--nexus-accent-primary)] text-white text-sm rounded-lg disabled:opacity-50 hover:opacity-90 transition-opacity"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                {addNote.isPending ? 'Saving…' : 'Add Note'}
              </button>
            </div>
          </div>
        </div>

        {/* Right: CRM sidebar */}
        <div className="w-72 flex-shrink-0 border-l border-[var(--nexus-divider)] overflow-y-auto">
          <div className="p-4 space-y-5">
            {/* Client card */}
            {ticket.client && (
              <section>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--nexus-text-tertiary)] mb-2 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" /> Client
                </h3>
                <div className="space-y-1 text-sm">
                  <div className="font-medium text-[var(--nexus-text-primary)]">{ticket.client.business_name}</div>
                  {ticket.client.primary_email && (
                    <div className="text-xs text-[var(--nexus-text-secondary)]">{ticket.client.primary_email}</div>
                  )}
                  {ticket.client.subscription_tier && (
                    <div className="text-xs">
                      <span className="text-[var(--nexus-text-tertiary)]">Plan: </span>
                      <span className="text-[var(--nexus-text-secondary)] capitalize">{ticket.client.subscription_tier}</span>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Contact */}
            {ticket.contact && (
              <section>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--nexus-text-tertiary)] mb-2 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" /> Contact
                </h3>
                <div className="text-sm">
                  <div className="font-medium text-[var(--nexus-text-primary)]">
                    {ticket.contact.first_name} {ticket.contact.last_name}
                  </div>
                  <div className="text-xs text-[var(--nexus-text-secondary)]">{ticket.contact.email}</div>
                </div>
              </section>
            )}

            {/* Ticket meta */}
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--nexus-text-tertiary)] mb-2">
                Details
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-[var(--nexus-text-tertiary)]">Source</span>
                  <span className="text-[var(--nexus-text-secondary)] capitalize">{ticket.source.replace('_', ' ')}</span>
                </div>
                {ticket.channel && (
                  <div className="flex justify-between">
                    <span className="text-[var(--nexus-text-tertiary)]">Channel</span>
                    <span className="text-[var(--nexus-text-secondary)] capitalize">{ticket.channel}</span>
                  </div>
                )}
                {ticket.app && (
                  <div className="flex justify-between">
                    <span className="text-[var(--nexus-text-tertiary)]">App</span>
                    <span className="text-[var(--nexus-text-secondary)]">{ticket.app.replace('_', ' ')}</span>
                  </div>
                )}
                {ticket.community && (
                  <div className="flex justify-between">
                    <span className="text-[var(--nexus-text-tertiary)]">Community</span>
                    <span className="text-[var(--nexus-text-secondary)] truncate ml-2">{ticket.community.name}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-[var(--nexus-text-tertiary)]">Created</span>
                  <span className="text-[var(--nexus-text-secondary)]">
                    {new Date(ticket.created_at).toLocaleDateString()}
                  </span>
                </div>
                {ticket.resolved_at && (
                  <div className="flex justify-between">
                    <span className="text-[var(--nexus-text-tertiary)]">Resolved</span>
                    <span className="text-[var(--nexus-text-secondary)]">
                      {new Date(ticket.resolved_at).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </section>

            {/* Priority quick-edit */}
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--nexus-text-tertiary)] mb-2">
                Priority
              </h3>
              <div className="flex gap-1 flex-wrap">
                {(['low', 'normal', 'high', 'critical'] as TicketPriority[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => updateTicket.mutate({ priority: p })}
                    className={`text-xs px-2 py-1 rounded-full capitalize border transition-colors ${
                      ticket.priority === p
                        ? PRIORITY_COLORS[p]
                        : 'text-[var(--nexus-text-tertiary)] border-[var(--nexus-divider)] hover:bg-[var(--nexus-bg-secondary)]'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </section>

            {/* Tags */}
            {ticket.tags && ticket.tags.length > 0 && (
              <section>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--nexus-text-tertiary)] mb-2">
                  Tags
                </h3>
                <div className="flex flex-wrap gap-1">
                  {ticket.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-0.5 rounded-full bg-[var(--nexus-bg-secondary)] text-[var(--nexus-text-secondary)]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
