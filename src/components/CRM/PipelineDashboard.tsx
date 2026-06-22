import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, DollarSign, MoreVertical, Target, TrendingUp, XCircle } from 'lucide-react';
import { PageHeader, DataCard, MetricCard } from '@/components/shared';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { usePipeline, useTransitionDeal } from '@/hooks/useDeals';
import type { Deal, DealStage, PipelineByStage } from '@/services/crm/deals-api';

const STAGE_ORDER: DealStage[] = ['hook', 'engagement', 'sales', 'retention', 'won', 'lost'];

const STAGE_LABELS: Record<DealStage, string> = {
  hook: 'Hook',
  engagement: 'Engagement',
  sales: 'Sales',
  retention: 'Retention',
  won: 'Won',
  lost: 'Lost',
};

const EMPTY_PIPELINE: PipelineByStage = {
  hook: [],
  engagement: [],
  sales: [],
  retention: [],
  won: [],
  lost: [],
};

const dealValue = (deal: Deal): number => Number(deal.value ?? 0) || 0;

type PendingLost = { deal: Deal } | null;

export default function PipelineDashboard() {
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = usePipeline();
  const transitionDeal = useTransitionDeal();

  const [pendingLost, setPendingLost] = useState<PendingLost>(null);
  const [lossReason, setLossReason] = useState('');

  const pipeline = data ?? EMPTY_PIPELINE;

  const allDeals = useMemo(() => STAGE_ORDER.flatMap((stage) => pipeline[stage]), [pipeline]);

  const totalValue = useMemo(
    () =>
      STAGE_ORDER.filter((s) => s !== 'won' && s !== 'lost').reduce(
        (acc, stage) => acc + pipeline[stage].reduce((sum, d) => sum + dealValue(d), 0),
        0,
      ),
    [pipeline],
  );
  const wonValue = useMemo(
    () => pipeline.won.reduce((acc, d) => acc + dealValue(d), 0),
    [pipeline],
  );
  const winRate = useMemo(() => {
    const closed = pipeline.won.length + pipeline.lost.length;
    return closed > 0 ? (pipeline.won.length / closed) * 100 : 0;
  }, [pipeline]);

  const moveDeal = (deal: Deal, stage: DealStage) => {
    if (stage === deal.stage) return;
    if (stage === 'lost') {
      setLossReason('');
      setPendingLost({ deal });
      return;
    }
    transitionDeal.mutate({ id: deal.id, stage });
  };

  const confirmLost = async () => {
    if (!pendingLost) return;
    try {
      await transitionDeal.mutateAsync({
        id: pendingLost.deal.id,
        stage: 'lost',
        lossReason: lossReason.trim() || undefined,
      });
      setPendingLost(null);
      setLossReason('');
    } catch {
      // Mutation error surfaces via the global api-error event; keep dialog open.
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Sales Pipeline"
        subtitle="Track and manage active deals across stages."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          label="Total Pipeline Value"
          value={formatCurrency(totalValue)}
          icon={DollarSign}
          color="blue"
          isLoading={isLoading}
        />
        <MetricCard
          label="Closed Won"
          value={formatCurrency(wonValue)}
          icon={Target}
          color="green"
          isLoading={isLoading}
        />
        <MetricCard
          label="Win Rate"
          value={`${winRate.toFixed(1)}%`}
          icon={TrendingUp}
          color="purple"
          isLoading={isLoading}
        />
      </div>

      {isError ? (
        <DataCard>
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[var(--nexus-bg-secondary)] border border-[var(--nexus-card-border)] flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-[var(--nexus-accent-danger)]" />
            </div>
            <h3 className="text-lg font-semibold text-[var(--nexus-text-primary)] mb-2">
              Couldn’t load pipeline
            </h3>
            <p className="text-sm text-[var(--nexus-text-secondary)] max-w-md mb-6">
              There was a problem fetching deals. Check your connection and try again.
            </p>
            <Button type="button" variant="outline" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        </DataCard>
      ) : (
        <DataCard
          title="Active Deals by Stage"
          isLoading={isLoading}
          className="bg-transparent border-0 shadow-none"
        >
          <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
            {STAGE_ORDER.map((stage) => {
              const stageDeals = pipeline[stage];
              return (
                <div
                  key={stage}
                  className="flex-1 min-w-[280px] bg-[var(--nexus-bg-secondary)] rounded-xl p-4 flex flex-col gap-3"
                >
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-bold text-sm text-[var(--nexus-text-primary)] uppercase tracking-wider">
                      {STAGE_LABELS[stage]}
                    </h4>
                    <span className="text-xs font-semibold text-[var(--nexus-text-tertiary)] bg-[var(--nexus-card-bg)] px-2 py-1 rounded-full shadow-sm">
                      {stageDeals.length}
                    </span>
                  </div>
                  {stageDeals.map((deal) => (
                    <div
                      key={deal.id}
                      className="bg-[var(--nexus-card-bg)] p-4 rounded-lg shadow-sm border border-[var(--nexus-card-border)] hover:border-[var(--nexus-accent-primary)] transition-colors group"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <button
                          type="button"
                          onClick={() => navigate(`/crm/deals/${deal.id}`)}
                          className="text-left font-medium text-[var(--nexus-text-primary)] text-sm group-hover:text-[var(--nexus-accent-primary)] transition-colors"
                        >
                          {deal.name}
                        </button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 shrink-0 text-[var(--nexus-text-tertiary)]"
                              aria-label={`Move deal ${deal.name}`}
                            >
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            {STAGE_ORDER.filter((s) => s !== deal.stage).map((target) => (
                              <DropdownMenuItem
                                key={target}
                                onClick={() => moveDeal(deal, target)}
                              >
                                {target === 'lost' ? (
                                  <span className="flex items-center gap-2 text-[var(--nexus-accent-danger)]">
                                    <XCircle className="w-4 h-4" />
                                    Mark Lost
                                  </span>
                                ) : (
                                  <span>Move to {STAGE_LABELS[target]}</span>
                                )}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      {deal.customer?.business_name && (
                        <p className="text-xs text-[var(--nexus-text-tertiary)] mb-2 truncate">
                          {deal.customer.business_name}
                        </p>
                      )}
                      <div className="flex justify-between items-end">
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(dealValue(deal))}
                        </span>
                        <span className="text-xs text-[var(--nexus-text-tertiary)] font-medium">
                          Prob: {deal.probability}%
                        </span>
                      </div>
                    </div>
                  ))}
                  {stageDeals.length === 0 && (
                    <div className="text-center text-xs text-[var(--nexus-text-tertiary)] py-6">
                      No deals in this stage
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </DataCard>
      )}

      {!isLoading && !isError && allDeals.length === 0 && (
        <DataCard>
          <div className="text-center py-12 text-sm text-[var(--nexus-text-tertiary)]">
            No deals yet. Deals will appear here as they move through the pipeline.
          </div>
        </DataCard>
      )}

      <Dialog
        open={pendingLost !== null}
        onOpenChange={(open) => {
          if (!open) {
            setPendingLost(null);
            setLossReason('');
          }
        }}
      >
        <DialogContent className="sm:max-w-md bg-[var(--nexus-bg-page)] border-[var(--nexus-card-border)]">
          <DialogHeader>
            <DialogTitle className="text-[var(--nexus-text-primary)]">Mark deal as lost</DialogTitle>
            <DialogDescription className="text-[var(--nexus-text-secondary)]">
              {`Mark “${pendingLost?.deal.name ?? ''}” as lost? Optionally record why below.`}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-2">
            <label
              htmlFor="loss-reason"
              className="block text-sm font-medium text-[var(--nexus-text-secondary)] mb-1.5"
            >
              Loss reason (optional)
            </label>
            <textarea
              id="loss-reason"
              value={lossReason}
              onChange={(e) => setLossReason(e.target.value)}
              rows={3}
              placeholder="e.g. Went with a competitor, budget cut, no response…"
              className="w-full rounded-lg border border-[var(--nexus-card-border)] bg-[var(--nexus-bg-page)] px-3 py-2 text-sm text-[var(--nexus-text-primary)] placeholder:text-[var(--nexus-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--nexus-accent-primary)]"
            />
          </div>
          <DialogFooter className="mt-6 flex gap-3 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setPendingLost(null);
                setLossReason('');
              }}
              disabled={transitionDeal.isPending}
              className="border-[var(--nexus-card-border)] text-[var(--nexus-text-secondary)] hover:bg-[var(--nexus-bg-secondary)]"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={confirmLost}
              disabled={transitionDeal.isPending}
              className="bg-[var(--nexus-accent-danger)] text-white hover:bg-red-600 border-none"
            >
              {transitionDeal.isPending ? 'Saving...' : 'Mark Lost'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
