import React from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, Target, BarChart3, ArrowRight } from 'lucide-react';
import { PageHeader, MetricCard, DataCard, LoadingState, EmptyState } from '@/components/shared';
import { useBusinessMode } from '@/hooks/useBusinessMode';
import { useDeals } from '@/hooks/useCrmData';

type Stage = 'lead' | 'proposal' | 'negotiation' | 'won' | 'lost';

interface PipelineDeal {
  id: string;
  name: string;
  value: number;
  stage: Stage;
}

const stageConfig: Record<Stage, { label: string; color: string }> = {
  lead: { label: 'Lead', color: 'bg-[var(--nexus-text-tertiary)]' },
  proposal: { label: 'Proposal', color: 'bg-amber-500' },
  negotiation: { label: 'Negotiation', color: 'bg-purple-500' },
  won: { label: 'Won', color: 'bg-emerald-500' },
  lost: { label: 'Lost', color: 'bg-red-500' },
};

const stages: Stage[] = ['lead', 'proposal', 'negotiation', 'won'];

function toStage(s: string): Stage {
  if (s === 'discovery') return 'lead';
  if (s === 'proposal' || s === 'negotiation' || s === 'won' || s === 'lost') return s;
  return 'lead';
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
}

export function PipelineDashboard() {
  const navigate = useNavigate();
  const { t } = useBusinessMode();
  const { deals: rawDeals, isLoading } = useDeals();

  const deals: PipelineDeal[] = rawDeals.map((d) => ({
    id: d.id,
    name: d.title,
    value: d.value,
    stage: toStage(d.stage),
  }));

  const totalPipelineValue = deals.reduce((sum, d) => sum + d.value, 0);

  if (isLoading) {
    return <LoadingState variant="card" />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('pipeline')}
        subtitle={`Manage your ${t('deals').toLowerCase()} across pipeline stages`}
        actions={
          <button
            type="button"
            onClick={() => navigate('/command-center/sell/customers')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-[var(--nexus-button-bg)] text-white hover:bg-[var(--nexus-button-hover)] transition-colors"
          >
            View {t('customers')}
            <ArrowRight className="w-4 h-4" />
          </button>
        }
      />

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Pipeline Value" value={formatCurrency(totalPipelineValue)} icon={DollarSign} color="green" />
        <MetricCard label="Win Rate" value="34%" icon={Target} color="blue" change={{ value: 5, direction: 'up' }} />
        <MetricCard label="Avg Deal Size" value={deals.length > 0 ? formatCurrency(Math.round(totalPipelineValue / deals.length)) : '$0'} icon={BarChart3} color="purple" />
        <MetricCard label={`${t('deals')} This Month`} value={String(deals.length)} icon={TrendingUp} color="amber" />
      </div>

      {deals.length === 0 ? (
        <EmptyState
          title={`No ${t('deals').toLowerCase()} yet`}
          description={`Create your first ${t('deal').toLowerCase()} to start tracking pipeline activity.`}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {stages.map((stage) => {
            const stageDeals = deals.filter((d) => d.stage === stage);
            const stageTotal = stageDeals.reduce((sum, d) => sum + d.value, 0);

            return (
              <motion.div
                key={stage}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: stages.indexOf(stage) * 0.05 }}
              >
                <DataCard
                  title={stageConfig[stage].label}
                  subtitle={`${stageDeals.length} ${t('deals').toLowerCase()} • ${formatCurrency(stageTotal)}`}
                >
                  <div className="space-y-3">
                    {stageDeals.map((deal) => (
                      <button
                        key={deal.id}
                        type="button"
                        onClick={() => navigate('/command-center/sell/customers')}
                        className="w-full text-left p-3 rounded-lg border border-[var(--nexus-card-border)] bg-[var(--nexus-bg-secondary)] hover:bg-[var(--nexus-card-bg-hover)] transition-colors"
                      >
                        <p className="text-sm font-medium text-[var(--nexus-text-primary)]">{deal.name}</p>
                        <p className="text-sm font-semibold text-[var(--nexus-accent-primary)] mt-2">{formatCurrency(deal.value)}</p>
                      </button>
                    ))}
                    {stageDeals.length === 0 && (
                      <p className="text-xs text-[var(--nexus-text-tertiary)] text-center py-4">No {t('deals').toLowerCase()}</p>
                    )}
                  </div>
                </DataCard>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
