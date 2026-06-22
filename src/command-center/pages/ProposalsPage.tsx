import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Plus, Send, CornerUpRight, Trash2, AlertCircle } from 'lucide-react';
import { PageHeader, DataCard, DataTable, StatusBadge, ConfirmDialog } from '@/components/shared';
import type { ColumnDef } from '@/components/shared';
import { Button } from '@/components/ui/button';
import {
  useQuotes,
  useSendQuote,
  useConvertQuoteToInvoice,
  useDeleteQuote,
} from '@/hooks/useQuotes';
import type { Quote } from '@/services/crm/quotes-api';
import { CreateProposalModal } from './proposals/CreateProposalModal';

type TabKey = 'draft' | 'sent' | 'won' | 'lost';

const TAB_STATUSES: Record<TabKey, string[]> = {
  draft: ['draft'],
  sent: ['sent'],
  won: ['accepted'],
  lost: ['declined', 'expired'],
};

const TAB_LABELS: Record<TabKey, string> = {
  draft: 'Draft',
  sent: 'Sent',
  won: 'Won',
  lost: 'Lost',
};

type BadgeStatus = Parameters<typeof StatusBadge>[0]['status'];

const STATUS_BADGE: Record<string, BadgeStatus> = {
  draft: 'draft',
  sent: 'pending',
  accepted: 'active',
  declined: 'cancelled',
  expired: 'overdue',
};

const formatCurrency = (value: string | number | undefined): string =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
    Number(value ?? 0) || 0,
  );

const formatDate = (value?: string): string =>
  value ? new Date(value).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : '—';

type PendingAction =
  | { type: 'send' | 'convert' | 'delete'; quote: Quote }
  | null;

export function ProposalsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('draft');
  const [createOpen, setCreateOpen] = useState(false);
  const [pending, setPending] = useState<PendingAction>(null);

  const { data, isLoading, isError, refetch } = useQuotes({ per_page: 100 });
  const sendQuote = useSendQuote();
  const convertQuote = useConvertQuoteToInvoice();
  const deleteQuote = useDeleteQuote();

  const quotes = useMemo(() => data?.data ?? [], [data]);

  const counts = useMemo(() => {
    const result: Record<TabKey, number> = { draft: 0, sent: 0, won: 0, lost: 0 };
    for (const quote of quotes) {
      (Object.keys(TAB_STATUSES) as TabKey[]).forEach((key) => {
        if (TAB_STATUSES[key].includes(quote.status)) result[key] += 1;
      });
    }
    return result;
  }, [quotes]);

  const visibleQuotes = useMemo(
    () => quotes.filter((quote) => TAB_STATUSES[activeTab].includes(quote.status)),
    [quotes, activeTab],
  );

  const tabs = (Object.keys(TAB_STATUSES) as TabKey[]).map((key) => ({
    key,
    label: TAB_LABELS[key],
    count: counts[key],
  }));

  const columns: ColumnDef<Quote>[] = [
    {
      header: 'Quote #',
      cell: (row) => (
        <span className="font-medium text-[var(--nexus-text-primary)]">{row.quote_number}</span>
      ),
    },
    {
      header: 'Customer',
      cell: (row) => row.customer?.business_name ?? '—',
    },
    {
      header: 'Total',
      cell: (row) => formatCurrency(row.total),
    },
    {
      header: 'Valid Until',
      cell: (row) => formatDate(row.valid_until),
    },
    {
      header: 'Status',
      cell: (row) => <StatusBadge status={STATUS_BADGE[row.status] ?? 'draft'} />,
    },
  ];

  const renderActions = (quote: Quote) => (
    <div className="flex items-center justify-end gap-1">
      {quote.status === 'draft' && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          title="Send to customer"
          aria-label={`Send quote ${quote.quote_number} to customer`}
          onClick={() => setPending({ type: 'send', quote })}
        >
          <Send className="w-4 h-4 text-[var(--nexus-accent-primary)]" />
        </Button>
      )}
      {quote.status === 'accepted' && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          title="Convert to invoice"
          aria-label={`Convert quote ${quote.quote_number} to invoice`}
          onClick={() => setPending({ type: 'convert', quote })}
        >
          <CornerUpRight className="w-4 h-4 text-[var(--nexus-accent-primary)]" />
        </Button>
      )}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        title="Delete quote"
        aria-label={`Delete quote ${quote.quote_number}`}
        onClick={() => setPending({ type: 'delete', quote })}
      >
        <Trash2 className="w-4 h-4 text-[var(--nexus-text-tertiary)]" />
      </Button>
    </div>
  );

  const confirmConfig = (() => {
    if (!pending) return null;
    switch (pending.type) {
      case 'send':
        return {
          title: 'Send proposal',
          description: `Send ${pending.quote.quote_number} to ${pending.quote.customer?.business_name ?? 'the customer'}? They will receive an email with the quote.`,
          confirmLabel: 'Send',
          variant: 'default' as const,
          isLoading: sendQuote.isPending,
          run: () => sendQuote.mutateAsync(pending.quote.id),
        };
      case 'convert':
        return {
          title: 'Convert to invoice',
          description: `Create an invoice from ${pending.quote.quote_number}? This generates a new invoice for ${pending.quote.customer?.business_name ?? 'the customer'}.`,
          confirmLabel: 'Convert',
          variant: 'default' as const,
          isLoading: convertQuote.isPending,
          run: () => convertQuote.mutateAsync(pending.quote.id),
        };
      case 'delete':
        return {
          title: 'Delete proposal',
          description: `Permanently delete ${pending.quote.quote_number}? This cannot be undone.`,
          confirmLabel: 'Delete',
          variant: 'destructive' as const,
          isLoading: deleteQuote.isPending,
          run: () => deleteQuote.mutateAsync(pending.quote.id),
        };
      default:
        return null;
    }
  })();

  const handleConfirm = async () => {
    if (!confirmConfig) return;
    try {
      await confirmConfig.run();
      setPending(null);
    } catch {
      // Mutation error surfaces via the global api-error event; keep dialog open.
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Proposals"
        subtitle="Create, track, and manage sales proposals"
        icon={FileText}
        actions={
          <Button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="bg-[var(--nexus-button-bg)] text-white hover:bg-[var(--nexus-button-hover)] border-none"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Proposal
          </Button>
        }
      />

      {/* Tabs */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <div className="flex items-center gap-1 p-1 rounded-lg bg-[var(--nexus-bg-secondary)] border border-[var(--nexus-card-border)] w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-[var(--nexus-card-bg)] text-[var(--nexus-text-primary)] shadow-sm'
                  : 'text-[var(--nexus-text-tertiary)] hover:text-[var(--nexus-text-secondary)]'
              }`}
            >
              {tab.label}
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full ${
                  activeTab === tab.key
                    ? 'bg-[var(--nexus-accent-primary)] text-white'
                    : 'bg-[var(--nexus-bg-secondary)] text-[var(--nexus-text-tertiary)]'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Content */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        {isError ? (
          <DataCard>
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-[var(--nexus-bg-secondary)] border border-[var(--nexus-card-border)] flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8 text-[var(--nexus-accent-danger)]" />
              </div>
              <h3 className="text-lg font-semibold text-[var(--nexus-text-primary)] mb-2">
                Couldn’t load proposals
              </h3>
              <p className="text-sm text-[var(--nexus-text-secondary)] max-w-md mb-6">
                There was a problem fetching proposals. Check your connection and try again.
              </p>
              <Button type="button" variant="outline" onClick={() => refetch()}>
                Retry
              </Button>
            </div>
          </DataCard>
        ) : (
          <DataCard noPadding>
            <DataTable<Quote>
              columns={columns}
              data={visibleQuotes}
              isLoading={isLoading}
              emptyMessage={`No ${TAB_LABELS[activeTab].toLowerCase()} proposals yet`}
              actions={renderActions}
            />
          </DataCard>
        )}
      </motion.div>

      <CreateProposalModal open={createOpen} onOpenChange={setCreateOpen} />

      <ConfirmDialog
        open={pending !== null}
        onOpenChange={(open) => {
          if (!open) setPending(null);
        }}
        title={confirmConfig?.title ?? ''}
        description={confirmConfig?.description ?? ''}
        confirmLabel={confirmConfig?.confirmLabel}
        variant={confirmConfig?.variant}
        isLoading={confirmConfig?.isLoading}
        onConfirm={handleConfirm}
      />
    </div>
  );
}
