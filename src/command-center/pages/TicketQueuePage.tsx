import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus, Filter, AlertTriangle, Clock, CheckCircle2,
  Circle, ChevronDown, RefreshCw,
} from 'lucide-react';
import { ticketService } from '@/services/ticketService';
import type {
  TicketFilters,
  TicketStatus,
  TicketType,
  TicketPriority,
  Ticket,
} from '@/types/tickets';

const PRIORITY_COLORS: Record<TicketPriority, string> = {
  critical: 'text-red-500 bg-red-500/10',
  high:     'text-orange-500 bg-orange-500/10',
  normal:   'text-blue-500 bg-blue-500/10',
  low:      'text-[var(--nexus-text-tertiary)] bg-[var(--nexus-bg-secondary)]',
};

const STATUS_ICONS: Record<string, React.ElementType> = {
  new:         Circle,
  open:        Circle,
  in_progress: RefreshCw,
  pending:     Clock,
  escalated:   AlertTriangle,
  resolved:    CheckCircle2,
  closed:      CheckCircle2,
  cancelled:   Circle,
};

const STATUS_COLORS: Record<string, string> = {
  new:         'text-[var(--nexus-text-secondary)]',
  open:        'text-blue-500',
  in_progress: 'text-yellow-500',
  pending:     'text-orange-400',
  escalated:   'text-red-500',
  resolved:    'text-green-500',
  closed:      'text-[var(--nexus-text-tertiary)]',
  cancelled:   'text-[var(--nexus-text-tertiary)]',
};

const VIEWS = [
  { key: 'all_open',   label: 'All Open' },
  { key: 'my_open',    label: 'Mine' },
  { key: 'unassigned', label: 'Unassigned' },
  { key: 'escalated',  label: 'Escalated' },
  { key: 'due_today',  label: 'Due Today' },
] as const;

function SlaBar({ ticket }: { ticket: Ticket }) {
  if (!ticket.due_at) return null;

  const created   = new Date(ticket.created_at).getTime();
  const due       = new Date(ticket.due_at).getTime();
  const now       = Date.now();
  const total     = due - created;
  const pct       = total > 0 ? Math.min(100, ((now - created) / total) * 100) : 100;
  const color     = pct >= 100 ? 'bg-red-500' : pct >= 80 ? 'bg-orange-500' : 'bg-green-500';

  return (
    <div className="w-full h-1 rounded-full bg-[var(--nexus-bg-secondary)] mt-1">
      <div className={`h-1 rounded-full ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

function CreateTicketModal({ onClose, onCreated }: { onClose: () => void; onCreated: (t: Ticket) => void }) {
  const [form, setForm] = useState({
    type: 'support' as TicketType,
    priority: 'normal' as TicketPriority,
    subject: '',
    description: '',
    source: 'manual' as const,
  });

  const mutation = useMutation({
    mutationFn: () => ticketService.create(form),
    onSuccess: (ticket) => { onCreated(ticket); onClose(); },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-[var(--nexus-bg-primary)] border border-[var(--nexus-divider)] rounded-xl p-6 w-full max-w-lg shadow-2xl">
        <h2 className="text-lg font-semibold text-[var(--nexus-text-primary)] mb-4">New Ticket</h2>
        <div className="space-y-3">
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs text-[var(--nexus-text-tertiary)] mb-1" htmlFor="ticket-type">Type</label>
              <select
                id="ticket-type"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as TicketType })}
                className="w-full bg-[var(--nexus-bg-secondary)] border border-[var(--nexus-divider)] rounded-lg px-3 py-2 text-sm text-[var(--nexus-text-primary)]"
              >
                <option value="support">Support</option>
                <option value="implementation">Implementation</option>
                <option value="sales">Sales</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-xs text-[var(--nexus-text-tertiary)] mb-1" htmlFor="ticket-priority">Priority</label>
              <select
                id="ticket-priority"
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value as TicketPriority })}
                className="w-full bg-[var(--nexus-bg-secondary)] border border-[var(--nexus-divider)] rounded-lg px-3 py-2 text-sm text-[var(--nexus-text-primary)]"
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs text-[var(--nexus-text-tertiary)] mb-1" htmlFor="ticket-subject">Subject</label>
            <input
              id="ticket-subject"
              type="text"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              placeholder="Brief description of the issue"
              className="w-full bg-[var(--nexus-bg-secondary)] border border-[var(--nexus-divider)] rounded-lg px-3 py-2 text-sm text-[var(--nexus-text-primary)] placeholder:text-[var(--nexus-text-tertiary)]"
            />
          </div>
          <div>
            <label className="block text-xs text-[var(--nexus-text-tertiary)] mb-1" htmlFor="ticket-description">Description</label>
            <textarea
              id="ticket-description"
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Additional details..."
              className="w-full bg-[var(--nexus-bg-secondary)] border border-[var(--nexus-divider)] rounded-lg px-3 py-2 text-sm text-[var(--nexus-text-primary)] placeholder:text-[var(--nexus-text-tertiary)] resize-none"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-[var(--nexus-text-secondary)] hover:text-[var(--nexus-text-primary)] transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => mutation.mutate()}
            disabled={!form.subject.trim() || mutation.isPending}
            className="px-4 py-2 text-sm bg-[var(--nexus-accent-primary)] text-white rounded-lg disabled:opacity-50 hover:opacity-90 transition-opacity"
          >
            {mutation.isPending ? 'Creating…' : 'Create Ticket'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function TicketQueuePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState<TicketFilters>({ view: 'all_open', per_page: 25 });
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showCreate, setShowCreate] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['tickets', filters],
    queryFn: () => ticketService.list(filters),
  });

  const tickets = data?.data ?? [];
  const meta    = data?.meta;

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selected.size === tickets.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(tickets.map((t) => t.id)));
    }
  };

  return (
    <div className="h-full flex flex-col bg-[var(--nexus-bg-primary)]">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--nexus-divider)]">
        <div>
          <h1 className="text-xl font-semibold text-[var(--nexus-text-primary)]">Support Queue</h1>
          {meta && (
            <p className="text-xs text-[var(--nexus-text-tertiary)] mt-0.5">
              {meta.total} ticket{meta.total !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--nexus-accent-primary)] text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          New Ticket
        </button>
      </div>

      {/* View Tabs */}
      <div className="flex items-center gap-1 px-6 py-2 border-b border-[var(--nexus-divider)] overflow-x-auto">
        {VIEWS.map((v) => (
          <button
            key={v.key}
            type="button"
            onClick={() => setFilters({ ...filters, view: v.key, page: 1 })}
            className={`px-3 py-1.5 text-sm rounded-lg whitespace-nowrap transition-colors ${
              filters.view === v.key
                ? 'bg-[var(--nexus-accent-primary)]/10 text-[var(--nexus-accent-primary)] font-medium'
                : 'text-[var(--nexus-text-secondary)] hover:bg-[var(--nexus-bg-secondary)]'
            }`}
          >
            {v.label}
          </button>
        ))}

        <div className="ml-auto flex items-center gap-2">
          {/* Type filter */}
          <select
            value={filters.type ?? ''}
            onChange={(e) => setFilters({ ...filters, type: (e.target.value as TicketType) || undefined, page: 1 })}
            className="bg-[var(--nexus-bg-secondary)] border border-[var(--nexus-divider)] text-[var(--nexus-text-secondary)] text-xs rounded-lg px-2 py-1"
            aria-label="Filter by type"
          >
            <option value="">All Types</option>
            <option value="support">Support</option>
            <option value="implementation">Implementation</option>
            <option value="sales">Sales</option>
          </select>
          {/* Priority filter */}
          <select
            value={filters.priority ?? ''}
            onChange={(e) => setFilters({ ...filters, priority: (e.target.value as TicketPriority) || undefined, page: 1 })}
            className="bg-[var(--nexus-bg-secondary)] border border-[var(--nexus-divider)] text-[var(--nexus-text-secondary)] text-xs rounded-lg px-2 py-1"
            aria-label="Filter by priority"
          >
            <option value="">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="normal">Normal</option>
            <option value="low">Low</option>
          </select>
          <Filter className="w-4 h-4 text-[var(--nexus-text-tertiary)]" />
        </div>
      </div>

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 px-6 py-2 bg-[var(--nexus-accent-primary)]/5 border-b border-[var(--nexus-divider)] text-sm">
          <span className="text-[var(--nexus-text-secondary)]">{selected.size} selected</span>
          {(
            [
              { label: 'Mark Open', status: 'open' as TicketStatus },
              { label: 'Mark Resolved', status: 'resolved' as TicketStatus },
              { label: 'Close', status: 'closed' as TicketStatus },
            ] as Array<{ label: string; status: TicketStatus }>
          ).map(({ label, status }) => (
            <button
              key={status}
              type="button"
              onClick={async () => {
                await ticketService.bulkUpdate([...selected], { status });
                setSelected(new Set());
                queryClient.invalidateQueries({ queryKey: ['tickets'] });
              }}
              className="px-2 py-1 text-xs rounded border border-[var(--nexus-divider)] text-[var(--nexus-text-secondary)] hover:bg-[var(--nexus-bg-secondary)] transition-colors"
            >
              {label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setSelected(new Set())}
            className="ml-auto text-[var(--nexus-text-tertiary)] hover:text-[var(--nexus-text-secondary)] transition-colors text-xs"
          >
            Clear
          </button>
        </div>
      )}

      {/* Table */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-6 h-6 border-2 border-[var(--nexus-accent-primary)] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : tickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-[var(--nexus-text-tertiary)]">
            <CheckCircle2 className="w-8 h-8 mb-2 opacity-30" />
            <p className="text-sm">No tickets in this view</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-[var(--nexus-bg-primary)] border-b border-[var(--nexus-divider)]">
              <tr>
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selected.size === tickets.length && tickets.length > 0}
                    onChange={selectAll}
                    className="rounded"
                    aria-label="Select all tickets"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--nexus-text-tertiary)] uppercase tracking-wide w-32">Number</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--nexus-text-tertiary)] uppercase tracking-wide">Subject</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--nexus-text-tertiary)] uppercase tracking-wide w-28">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--nexus-text-tertiary)] uppercase tracking-wide w-24">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--nexus-text-tertiary)] uppercase tracking-wide w-24">Priority</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--nexus-text-tertiary)] uppercase tracking-wide w-40">Client</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--nexus-text-tertiary)] uppercase tracking-wide w-32">Due / SLA</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((ticket) => {
                const StatusIcon = STATUS_ICONS[ticket.status] ?? Circle;
                return (
                  <tr
                    key={ticket.id}
                    onClick={() => navigate(`/command-center/support/${ticket.id}`)}
                    className="border-b border-[var(--nexus-divider)] hover:bg-[var(--nexus-bg-secondary)] cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selected.has(ticket.id)}
                        onChange={() => toggleSelect(ticket.id)}
                        className="rounded"
                        aria-label={`Select ticket ${ticket.ticket_number}`}
                      />
                    </td>
                    <td className="px-4 py-3 text-xs font-mono text-[var(--nexus-text-tertiary)]">
                      {ticket.ticket_number}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-[var(--nexus-text-primary)] truncate max-w-xs">
                        {ticket.subject}
                      </div>
                      {ticket.due_at && <SlaBar ticket={ticket} />}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs capitalize text-[var(--nexus-text-secondary)]">
                        {ticket.type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className={`flex items-center gap-1.5 text-xs ${STATUS_COLORS[ticket.status]}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        <span className="capitalize">{ticket.status.replace('_', ' ')}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full capitalize font-medium ${PRIORITY_COLORS[ticket.priority]}`}>
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-[var(--nexus-text-secondary)] truncate">
                      {ticket.client?.business_name ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-xs text-[var(--nexus-text-tertiary)]">
                      {ticket.due_at
                        ? new Date(ticket.due_at).toLocaleDateString()
                        : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {meta && meta.last_page > 1 && (
        <div className="flex items-center justify-between px-6 py-3 border-t border-[var(--nexus-divider)] text-sm text-[var(--nexus-text-secondary)]">
          <span>Page {meta.current_page} of {meta.last_page}</span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={meta.current_page <= 1}
              onClick={() => setFilters({ ...filters, page: meta.current_page - 1 })}
              className="px-3 py-1 rounded border border-[var(--nexus-divider)] disabled:opacity-40 hover:bg-[var(--nexus-bg-secondary)] transition-colors"
            >
              Prev
            </button>
            <button
              type="button"
              disabled={meta.current_page >= meta.last_page}
              onClick={() => setFilters({ ...filters, page: meta.current_page + 1 })}
              className="px-3 py-1 rounded border border-[var(--nexus-divider)] disabled:opacity-40 hover:bg-[var(--nexus-bg-secondary)] transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {showCreate && (
        <CreateTicketModal
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            queryClient.invalidateQueries({ queryKey: ['tickets'] });
          }}
        />
      )}
    </div>
  );
}
