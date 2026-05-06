import React from 'react';
import { motion } from 'framer-motion';
import { Workflow, Settings, Plus } from 'lucide-react';
import { PageHeader, DataCard } from '@/components/shared';

interface ProcessTemplate {
  name: string;
  description: string;
  stepCount: number;
}

const processTemplates: ProcessTemplate[] = [
  {
    name: 'Onboarding',
    description: 'Welcome new customers with a structured onboarding sequence',
    stepCount: 5,
  },
  {
    name: 'Lead Qualification',
    description: 'Score and route inbound leads based on fit and intent signals',
    stepCount: 4,
  },
  {
    name: 'Content Review',
    description: 'Multi-stage approval workflow for articles, emails, and campaigns',
    stepCount: 3,
  },
  {
    name: 'Customer Support',
    description: 'Triage, assign, and resolve support requests with SLA tracking',
    stepCount: 6,
  },
];

export function ProcessesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Processes"
        subtitle="Design and manage repeatable business workflows"
        icon={Workflow}
        actions={
          <button
            type="button"
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-[var(--nexus-button-bg)] text-white hover:bg-[var(--nexus-button-hover)] transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Process
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {processTemplates.map((process, index) => (
          <motion.div
            key={process.name}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <DataCard title={process.name} icon={Workflow}>
              <div className="space-y-4">
                <p className="text-sm text-[var(--nexus-text-secondary)]">
                  {process.description}
                </p>

                <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--nexus-bg-secondary)] border border-[var(--nexus-card-border)]">
                  <div className="flex items-center gap-2">
                    <Settings className="w-4 h-4 text-[var(--nexus-text-tertiary)]" />
                    <span className="text-sm text-[var(--nexus-text-secondary)]">
                      {process.stepCount} steps
                    </span>
                  </div>
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-[var(--nexus-bg-secondary)] border border-[var(--nexus-card-border)] text-[var(--nexus-text-tertiary)]">
                    Not configured
                  </span>
                </div>

                <button
                  type="button"
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border border-[var(--nexus-card-border)] text-[var(--nexus-text-primary)] hover:bg-[var(--nexus-bg-secondary)] transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  Set Up
                </button>
              </div>
            </DataCard>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
