import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Plus, Filter } from 'lucide-react';
import { PageHeader, DataCard } from '@/components/shared';

type TabKey = 'draft' | 'sent' | 'won' | 'lost';

interface Tab {
  key: TabKey;
  label: string;
  count: number;
}

const tabs: Tab[] = [
  { key: 'draft', label: 'Draft', count: 0 },
  { key: 'sent', label: 'Sent', count: 0 },
  { key: 'won', label: 'Won', count: 0 },
  { key: 'lost', label: 'Lost', count: 0 },
];

export function ProposalsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('draft');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Proposals"
        subtitle="Create, track, and manage sales proposals"
        icon={FileText}
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border border-[var(--nexus-card-border)] text-[var(--nexus-text-secondary)] hover:bg-[var(--nexus-bg-secondary)] transition-colors"
            >
              <Filter className="w-4 h-4" />
              Filter
            </button>
            <button
              type="button"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-[var(--nexus-button-bg)] text-white hover:bg-[var(--nexus-button-hover)] transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Proposal
            </button>
          </div>
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
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                activeTab === tab.key
                  ? 'bg-[var(--nexus-accent-primary)] text-white'
                  : 'bg-[var(--nexus-bg-secondary)] text-[var(--nexus-text-tertiary)]'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Empty State */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <DataCard>
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[var(--nexus-bg-secondary)] border border-[var(--nexus-card-border)] flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-[var(--nexus-text-tertiary)]" />
            </div>
            <h3 className="text-lg font-semibold text-[var(--nexus-text-primary)] mb-2">
              No proposals yet
            </h3>
            <p className="text-sm text-[var(--nexus-text-secondary)] max-w-md mb-6">
              Create professional proposals to send to prospects. Track their status from draft
              through to won or lost.
            </p>
            <button
              type="button"
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium bg-[var(--nexus-button-bg)] text-white hover:bg-[var(--nexus-button-hover)] transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Proposal
            </button>
          </div>
        </DataCard>
      </motion.div>
    </div>
  );
}
