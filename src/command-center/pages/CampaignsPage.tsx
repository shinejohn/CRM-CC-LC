import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Megaphone,
  Plus,
  Play,
  Trash2,
  AlertCircle,
  Mail,
  Phone,
  MessageSquare,
} from 'lucide-react';
import { PageHeader, DataCard, DataTable, StatusBadge, ConfirmDialog } from '@/components/shared';
import type { ColumnDef } from '@/components/shared';
import { Button } from '@/components/ui/button';
import {
  useOutboundCampaigns,
  useStartOutboundCampaign,
  useDeleteOutboundCampaign,
} from '@/hooks/useOutboundCampaigns';
import type {
  OutboundCampaign,
  OutboundCampaignStatus,
} from '@/services/crm/outbound-campaigns-api';
import { CreateCampaignModal } from './campaigns/CreateCampaignModal';
import { CampaignAnalyticsPanel } from './campaigns/CampaignAnalyticsPanel';

type TabKey = 'all' | 'draft' | 'scheduled' | 'running' | 'completed';

const TAB_STATUSES: Record<TabKey, OutboundCampaignStatus[] | null> = {
  all: null,
  draft: ['draft'],
  scheduled: ['scheduled'],
  running: ['running', 'paused'],
  completed: ['completed', 'cancelled'],
};

const TAB_LABELS: Record<TabKey, string> = {
  all: 'All',
  draft: 'Draft',
  scheduled: 'Scheduled',
  running: 'Running',
  completed: 'Completed',
};

type BadgeStatus = Parameters<typeof StatusBadge>[0]['status'];

const STATUS_BADGE: Record<OutboundCampaignStatus, BadgeStatus> = {
  draft: 'draft',
  scheduled: 'pending',
  running: 'active',
  paused: 'inactive',
  completed: 'completed',
  cancelled: 'cancelled',
};

const TYPE_ICON = {
  email: Mail,
  phone: Phone,
  sms: MessageSquare,
} as const;

const formatDate = (value?: string | null): string =>
  value
    ? new Date(value).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
    : '—';

const openRate = (campaign: OutboundCampaign): string => {
  if (campaign.delivered_count === 0) return '—';
  return `${((campaign.opened_count / campaign.delivered_count) * 100).toFixed(1)}%`;
};

type PendingAction = { type: 'start' | 'delete'; campaign: OutboundCampaign } | null;

export default function CampaignsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const [createOpen, setCreateOpen] = useState(false);
  const [pending, setPending] = useState<PendingAction>(null);
  const [detailCampaign, setDetailCampaign] = useState<OutboundCampaign | null>(null);

  const { data, isLoading, isError, refetch } = useOutboundCampaigns({ per_page: 100 });
  const startCampaign = useStartOutboundCampaign();
  const deleteCampaign = useDeleteOutboundCampaign();

  const campaigns = useMemo(() => data?.data ?? [], [data]);

  const counts = useMemo(() => {
    const result: Record<TabKey, number> = {
      all: campaigns.length,
      draft: 0,
      scheduled: 0,
      running: 0,
      completed: 0,
    };
    for (const campaign of campaigns) {
      (Object.keys(TAB_STATUSES) as TabKey[]).forEach((key) => {
        const statuses = TAB_STATUSES[key];
        if (statuses && statuses.includes(campaign.status)) result[key] += 1;
      });
    }
    return result;
  }, [campaigns]);

  const visibleCampaigns = useMemo(() => {
    const statuses = TAB_STATUSES[activeTab];
    if (!statuses) return campaigns;
    return campaigns.filter((campaign) => statuses.includes(campaign.status));
  }, [campaigns, activeTab]);

  const tabs = (Object.keys(TAB_STATUSES) as TabKey[]).map((key) => ({
    key,
    label: TAB_LABELS[key],
    count: counts[key],
  }));

  const columns: ColumnDef<OutboundCampaign>[] = [
    {
      header: 'Campaign',
      cell: (row) => {
        const Icon = TYPE_ICON[row.type];
        return (
          <div className="flex items-center gap-2">
            <Icon className="w-4 h-4 text-[var(--nexus-text-tertiary)]" />
            <span className="font-medium text-[var(--nexus-text-primary)]">{row.name}</span>
          </div>
        );
      },
    },
    {
      header: 'Channel',
      cell: (row) => <span className="capitalize">{row.type}</span>,
    },
    {
      header: 'Recipients',
      cell: (row) => row.total_recipients ?? 0,
    },
    {
      header: 'Sent',
      cell: (row) => row.sent_count ?? 0,
    },
    {
      header: 'Open rate',
      cell: (row) => openRate(row),
    },
    {
      header: 'Created',
      cell: (row) => formatDate(row.created_at),
    },
    {
      header: 'Status',
      cell: (row) => <StatusBadge status={STATUS_BADGE[row.status] ?? 'draft'} />,
    },
  ];

  const renderActions = (campaign: OutboundCampaign) => (
    <div className="flex items-center justify-end gap-1">
      {(campaign.status === 'draft' || campaign.status === 'scheduled') && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          title="Start campaign"
          aria-label={`Start campaign ${campaign.name}`}
          onClick={(e) => {
            e.stopPropagation();
            setPending({ type: 'start', campaign });
          }}
        >
          <Play className="w-4 h-4 text-[var(--nexus-accent-primary)]" />
        </Button>
      )}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        title="Delete campaign"
        aria-label={`Delete campaign ${campaign.name}`}
        onClick={(e) => {
          e.stopPropagation();
          setPending({ type: 'delete', campaign });
        }}
      >
        <Trash2 className="w-4 h-4 text-[var(--nexus-text-tertiary)]" />
      </Button>
    </div>
  );

  const confirmConfig = (() => {
    if (!pending) return null;
    switch (pending.type) {
      case 'start':
        return {
          title: 'Start campaign',
          description: `Start "${pending.campaign.name}"? Recipients will be resolved from your audience filters and messages queued for sending.`,
          confirmLabel: 'Start',
          variant: 'default' as const,
          isLoading: startCampaign.isPending,
          run: () => startCampaign.mutateAsync(pending.campaign.id),
        };
      case 'delete':
        return {
          title: 'Delete campaign',
          description: `Permanently delete "${pending.campaign.name}"? This cannot be undone.`,
          confirmLabel: 'Delete',
          variant: 'destructive' as const,
          isLoading: deleteCampaign.isPending,
          run: () => deleteCampaign.mutateAsync(pending.campaign.id),
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
        title="Campaigns"
        subtitle="Create and manage outbound email, phone, and SMS campaigns"
        icon={Megaphone}
        actions={
          <Button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="bg-[var(--nexus-button-bg)] text-white hover:bg-[var(--nexus-button-hover)] border-none"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Campaign
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
                Couldn’t load campaigns
              </h3>
              <p className="text-sm text-[var(--nexus-text-secondary)] max-w-md mb-6">
                There was a problem fetching campaigns. Check your connection and try again.
              </p>
              <Button type="button" variant="outline" onClick={() => refetch()}>
                Retry
              </Button>
            </div>
          </DataCard>
        ) : (
          <DataCard noPadding>
            <DataTable<OutboundCampaign>
              columns={columns}
              data={visibleCampaigns}
              isLoading={isLoading}
              emptyMessage={
                activeTab === 'all'
                  ? 'No campaigns yet — create your first one'
                  : `No ${TAB_LABELS[activeTab].toLowerCase()} campaigns`
              }
              onRowClick={(row) => setDetailCampaign(row)}
              actions={renderActions}
            />
          </DataCard>
        )}
      </motion.div>

      <CreateCampaignModal open={createOpen} onOpenChange={setCreateOpen} />

      <CampaignAnalyticsPanel
        campaign={detailCampaign}
        open={detailCampaign !== null}
        onOpenChange={(open) => {
          if (!open) setDetailCampaign(null);
        }}
      />

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
