import React from 'react';
import { motion } from 'framer-motion';
import { Plug, Check, X } from 'lucide-react';
import { PageHeader, DataCard } from '@/components/shared';

interface Integration {
  name: string;
  description: string;
  connected: boolean;
}

interface IntegrationCategory {
  category: string;
  integrations: Integration[];
}

const integrationCategories: IntegrationCategory[] = [
  {
    category: 'Email',
    integrations: [
      { name: 'Postal', description: 'Transactional and campaign email delivery', connected: false },
      { name: 'ZeroBounce', description: 'Email verification and list hygiene', connected: false },
    ],
  },
  {
    category: 'Payments',
    integrations: [
      { name: 'Stripe', description: 'Payment processing, subscriptions, and invoicing', connected: false },
    ],
  },
  {
    category: 'AI',
    integrations: [
      { name: 'Anthropic', description: 'AI-powered content generation and analysis', connected: false },
    ],
  },
  {
    category: 'Publishing',
    integrations: [
      { name: 'WordPress', description: 'Content publishing and syndication bridge', connected: false },
    ],
  },
];

export function IntegrationsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Integrations"
        subtitle="Connect external services to power your workflows"
        icon={Plug}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {integrationCategories.map((category, catIndex) => (
          <motion.div
            key={category.category}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: catIndex * 0.05 }}
          >
            <DataCard title={category.category} icon={Plug}>
              <div className="space-y-3">
                {category.integrations.map((integration) => (
                  <div
                    key={integration.name}
                    className="flex items-center gap-4 p-3 rounded-lg bg-[var(--nexus-bg-secondary)] border border-[var(--nexus-card-border)]"
                  >
                    <div className="w-10 h-10 rounded-lg bg-[var(--nexus-bg-secondary)] border border-[var(--nexus-card-border)] flex items-center justify-center shrink-0">
                      <Plug className="w-5 h-5 text-[var(--nexus-text-tertiary)]" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--nexus-text-primary)]">
                        {integration.name}
                      </p>
                      <p className="text-xs text-[var(--nexus-text-secondary)] truncate">
                        {integration.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {integration.connected ? (
                        <span className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                          <Check className="w-3 h-3" />
                          Connected
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-[var(--nexus-bg-secondary)] border border-[var(--nexus-card-border)] text-[var(--nexus-text-tertiary)]">
                          <X className="w-3 h-3" />
                          Not connected
                        </span>
                      )}
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border border-[var(--nexus-card-border)] text-[var(--nexus-text-primary)] hover:bg-[var(--nexus-bg-secondary)] transition-colors"
                >
                  Configure {category.category}
                </button>
              </div>
            </DataCard>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
