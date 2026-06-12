import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { Radio, ExternalLink, ChevronRight } from 'lucide-react';
import { ticketService } from '@/services/ticketService';
import type { MonitoringSignal } from '@/types/tickets';

const SIGNAL_TYPE_COLORS: Record<string, string> = {
  complaint:     'text-red-500 bg-red-500/10',
  bug_report:    'text-orange-500 bg-orange-500/10',
  content_error: 'text-yellow-500 bg-yellow-500/10',
  positive:      'text-green-500 bg-green-500/10',
  spam:          'text-[var(--nexus-text-tertiary)] bg-[var(--nexus-bg-secondary)]',
  other:         'text-blue-500 bg-blue-500/10',
};

function SignalRow({ signal }: { signal: MonitoringSignal }) {
  const queryClient = useQueryClient();
  const navigate    = useNavigate();

  const promote = useMutation({
    mutationFn: () => ticketService.promoteSignal(signal.id),
    onSuccess: (ticket) => {
      queryClient.invalidateQueries({ queryKey: ['monitoring-signals'] });
      navigate(`/command-center/support/${ticket.id}`);
    },
  });

  const dismiss = useMutation({
    mutationFn: () => ticketService.dismissSignal(signal.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['monitoring-signals'] }),
  });

  const reviewed = !!signal.reviewed_at;

  return (
    <div className={`p-4 border-b border-[var(--nexus-divider)] ${reviewed ? 'opacity-50' : ''}`}>
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs px-2 py-0.5 rounded-full capitalize font-medium ${SIGNAL_TYPE_COLORS[signal.signal_type] ?? 'text-[var(--nexus-text-secondary)]'}`}>
              {signal.signal_type.replace('_', ' ')}
            </span>
            <span className="text-xs text-[var(--nexus-text-tertiary)] capitalize">
              {signal.source_platform}
            </span>
            {signal.community && (
              <span className="text-xs text-[var(--nexus-text-tertiary)]">
                · {signal.community.name}
              </span>
            )}
            <span className="text-xs text-[var(--nexus-text-tertiary)] ml-auto">
              {new Date(signal.detected_at).toLocaleString()}
            </span>
          </div>
          <p className="text-sm text-[var(--nexus-text-primary)] line-clamp-2">{signal.raw_content}</p>
          {signal.url && (
            <a
              href={signal.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-[var(--nexus-accent-primary)] mt-1 hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="w-3 h-3" /> View source
            </a>
          )}
          {signal.ticket_id && (
            <button
              type="button"
              onClick={() => navigate(`/command-center/support/${signal.ticket_id}`)}
              className="inline-flex items-center gap-1 text-xs text-[var(--nexus-accent-primary)] mt-1 ml-3 hover:underline"
            >
              <ChevronRight className="w-3 h-3" /> View ticket
            </button>
          )}
        </div>
        {!reviewed && !signal.ticket_id && (
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={() => promote.mutate()}
              disabled={promote.isPending}
              className="px-3 py-1 text-xs bg-[var(--nexus-accent-primary)] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {promote.isPending ? '…' : 'Create Ticket'}
            </button>
            <button
              type="button"
              onClick={() => dismiss.mutate()}
              disabled={dismiss.isPending}
              className="px-3 py-1 text-xs border border-[var(--nexus-divider)] text-[var(--nexus-text-secondary)] rounded-lg hover:bg-[var(--nexus-bg-secondary)] transition-colors disabled:opacity-50"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function MonitoringSignalsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['monitoring-signals'],
    queryFn: () => ticketService.listSignals({ per_page: 50 }),
  });

  const signals = data?.data ?? [];

  return (
    <div className="h-full flex flex-col bg-[var(--nexus-bg-primary)]">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-[var(--nexus-divider)]">
        <Radio className="w-5 h-5 text-[var(--nexus-accent-primary)]" />
        <h1 className="text-xl font-semibold text-[var(--nexus-text-primary)]">Monitoring Signals</h1>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-6 h-6 border-2 border-[var(--nexus-accent-primary)] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : signals.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-[var(--nexus-text-tertiary)]">
            <Radio className="w-8 h-8 mb-2 opacity-30" />
            <p className="text-sm">No signals detected yet</p>
          </div>
        ) : (
          signals.map((signal) => <SignalRow key={signal.id} signal={signal} />)
        )}
      </div>
    </div>
  );
}
