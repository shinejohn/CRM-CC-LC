import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Inbox, Mail, ArrowUpRight,
  Archive, MessageSquare, Send, Filter, Clock,
  SmilePlus, Meh, Frown, XCircle,
} from 'lucide-react';
import { PageHeader, DataCard } from '@/components/shared';
import {
  getInboundEmails,
  updateInboundEmailStatus,
  escalateInboundEmail,
} from '@/services/email-engine-api';

type StatusFilter = 'all' | 'pending' | 'responded' | 'escalated' | 'archived';

const sentimentConfig = {
  positive: { icon: SmilePlus, color: 'text-green-400', bg: 'bg-green-500/10' },
  neutral: { icon: Meh, color: 'text-gray-400', bg: 'bg-gray-500/10' },
  negative: { icon: Frown, color: 'text-red-400', bg: 'bg-red-500/10' },
};

const intentColors: Record<string, string> = {
  question: 'bg-blue-500/10 text-blue-400',
  complaint: 'bg-red-500/10 text-red-400',
  appointment: 'bg-purple-500/10 text-purple-400',
  support: 'bg-amber-500/10 text-amber-400',
  pricing: 'bg-cyan-500/10 text-cyan-400',
  other: 'bg-gray-500/10 text-gray-400',
};

const statusColors: Record<string, string> = {
  pending: 'bg-amber-500/10 text-amber-400',
  responded: 'bg-green-500/10 text-green-400',
  escalated: 'bg-red-500/10 text-red-400',
  archived: 'bg-gray-500/10 text-gray-400',
};

function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-48 bg-[var(--nexus-bg-tertiary)] rounded" />
      <div className="flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-8 w-24 bg-[var(--nexus-bg-tertiary)] rounded-full" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="lg:col-span-2 space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 bg-[var(--nexus-bg-tertiary)] rounded-lg" />
          ))}
        </div>
        <div className="lg:col-span-3 h-80 bg-[var(--nexus-bg-tertiary)] rounded-lg" />
      </div>
    </div>
  );
}

export function InboundInboxPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data: emails = [], isLoading, error } = useQuery({
    queryKey: ['inbound-inbox', filter === 'all' ? undefined : filter],
    queryFn: () => getInboundEmails(filter === 'all' ? undefined : { status: filter }),
  });

  const escalateMutation = useMutation({
    mutationFn: (id: string) => escalateInboundEmail(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inbound-inbox'] });
    },
  });

  const archiveMutation = useMutation({
    mutationFn: (id: string) => updateInboundEmailStatus(id, 'archived'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inbound-inbox'] });
    },
  });

  const selected = emails.find((e) => e.id === selectedId);
  const pendingCount = emails.filter((e) => e.status === 'pending').length;

  const filters: { key: StatusFilter; label: string; count?: number }[] = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending', count: pendingCount },
    { key: 'responded', label: 'AI Responded' },
    { key: 'escalated', label: 'Escalated' },
    { key: 'archived', label: 'Archived' },
  ];

  if (isLoading) return <LoadingSkeleton />;

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Inbound Inbox"
          subtitle="AI-powered email triage — review replies, override AI responses, and manage escalations"
        />
        <div className="p-8 text-center text-red-400 bg-red-500/5 rounded-lg border border-red-500/20">
          <XCircle className="w-8 h-8 mx-auto mb-2" />
          <p className="text-sm">Failed to load inbound emails. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inbound Inbox"
        subtitle="AI-powered email triage — review replies, override AI responses, and manage escalations"
      />

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="w-4 h-4 text-[var(--nexus-text-tertiary)]" />
        {filters.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filter === f.key
                ? 'bg-[var(--nexus-accent-primary)] text-white'
                : 'bg-[var(--nexus-bg-secondary)] text-[var(--nexus-text-secondary)] hover:bg-[var(--nexus-bg-tertiary)]'
            }`}
          >
            {f.label}
            {f.count !== undefined && f.count > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-white/20 text-[10px]">{f.count}</span>
            )}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Email List */}
        <div className="lg:col-span-2 space-y-2">
          {emails.length === 0 ? (
            <div className="p-8 text-center text-[var(--nexus-text-tertiary)]">
              <Inbox className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No emails match this filter</p>
            </div>
          ) : (
            emails.map((email) => {
              const SentimentIcon = sentimentConfig[email.sentiment].icon;
              const isSelected = selectedId === email.id;
              return (
                <motion.button
                  key={email.id}
                  type="button"
                  onClick={() => setSelectedId(email.id)}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`w-full text-left p-4 rounded-lg border transition-colors ${
                    isSelected
                      ? 'border-[var(--nexus-accent-primary)] bg-[var(--nexus-accent-primary)]/5'
                      : 'border-[var(--nexus-card-border)] bg-[var(--nexus-card-bg)] hover:bg-[var(--nexus-card-bg-hover)]'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-1.5 rounded-full ${sentimentConfig[email.sentiment].bg} shrink-0 mt-0.5`}>
                      <SentimentIcon className={`w-3.5 h-3.5 ${sentimentConfig[email.sentiment].color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-[var(--nexus-text-primary)] truncate">{email.customer_name ?? email.from_email}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${statusColors[email.status]}`}>{email.status}</span>
                      </div>
                      <p className="text-sm text-[var(--nexus-text-secondary)] truncate">{email.subject}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${intentColors[email.intent] ?? intentColors.other}`}>{email.intent}</span>
                        <span className="text-[10px] text-[var(--nexus-text-tertiary)]">
                          <Clock className="w-3 h-3 inline mr-0.5" />
                          {new Date(email.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {email.ai_responded && (
                          <span className="text-[10px] text-blue-400 flex items-center gap-0.5">
                            <MessageSquare className="w-3 h-3" /> AI
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.button>
              );
            })
          )}
        </div>

        {/* Detail Panel */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            {selected ? (
              <motion.div
                key={selected.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <DataCard title={selected.subject} icon={Mail}>
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-[var(--nexus-divider)]">
                    <div>
                      <p className="text-sm font-medium text-[var(--nexus-text-primary)]">{selected.from_email}</p>
                      <p className="text-xs text-[var(--nexus-text-tertiary)]">
                        {selected.customer_name && `${selected.customer_name} - `}
                        {new Date(selected.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {(() => {
                        const SIcon = sentimentConfig[selected.sentiment].icon;
                        return (
                          <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${sentimentConfig[selected.sentiment].bg} ${sentimentConfig[selected.sentiment].color}`}>
                            <SIcon className="w-3.5 h-3.5" />
                            {selected.sentiment}
                          </span>
                        );
                      })()}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${intentColors[selected.intent] ?? intentColors.other}`}>
                        {selected.intent}
                      </span>
                    </div>
                  </div>

                  {/* Original Email Body */}
                  <div className="mb-4">
                    <h4 className="text-xs font-semibold text-[var(--nexus-text-tertiary)] uppercase tracking-wider mb-2">Customer Message</h4>
                    <div className="p-4 rounded-lg bg-[var(--nexus-bg-secondary)] text-sm text-[var(--nexus-text-primary)] leading-relaxed">
                      {selected.body}
                    </div>
                  </div>

                  {/* AI Response */}
                  {selected.ai_response && (
                    <div className="mb-4">
                      <h4 className="text-xs font-semibold text-[var(--nexus-text-tertiary)] uppercase tracking-wider mb-2 flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5" />
                        AI Response {selected.status === 'responded' ? '(Sent)' : '(Draft)'}
                      </h4>
                      <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/20 text-sm text-[var(--nexus-text-primary)] leading-relaxed">
                        {selected.ai_response}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center gap-3 pt-4 border-t border-[var(--nexus-divider)]">
                    {selected.status === 'pending' && (
                      <>
                        <button type="button" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--nexus-accent-primary)] text-white text-sm font-medium hover:opacity-90 transition-colors">
                          <Send className="w-4 h-4" />
                          Generate AI Response
                        </button>
                        <button
                          type="button"
                          onClick={() => escalateMutation.mutate(selected.id)}
                          disabled={escalateMutation.isPending}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 text-red-400 text-sm font-medium hover:bg-red-500/20 transition-colors disabled:opacity-50"
                        >
                          <ArrowUpRight className="w-4 h-4" />
                          Escalate
                        </button>
                      </>
                    )}
                    {selected.ai_response && selected.status !== 'archived' && (
                      <button type="button" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/10 text-amber-400 text-sm font-medium hover:bg-amber-500/20 transition-colors">
                        <MessageSquare className="w-4 h-4" />
                        Override Response
                      </button>
                    )}
                    {selected.status !== 'archived' && (
                      <button
                        type="button"
                        onClick={() => archiveMutation.mutate(selected.id)}
                        disabled={archiveMutation.isPending}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--nexus-bg-secondary)] text-[var(--nexus-text-secondary)] text-sm font-medium hover:bg-[var(--nexus-bg-tertiary)] transition-colors disabled:opacity-50"
                      >
                        <Archive className="w-4 h-4" />
                        Archive
                      </button>
                    )}
                  </div>
                </DataCard>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-20 text-[var(--nexus-text-tertiary)]"
              >
                <Mail className="w-12 h-12 mb-3 opacity-30" />
                <p className="text-sm">Select an email to view details</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
