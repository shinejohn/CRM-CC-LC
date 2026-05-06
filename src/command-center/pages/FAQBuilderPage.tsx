import { motion } from 'framer-motion';
import { HelpCircle, Plus, FolderOpen } from 'lucide-react';
import { PageHeader, DataCard } from '@/components/shared';

const categories = [
  { name: 'General', count: 0 },
  { name: 'Pricing', count: 0 },
  { name: 'Services', count: 0 },
  { name: 'Support', count: 0 },
];

export function FAQBuilderPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="FAQ Builder"
        subtitle="Create and organize frequently asked questions for your customers and AI employees"
        icon={HelpCircle}
        actions={
          <button
            type="button"
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-[var(--nexus-button-bg)] text-white hover:bg-[var(--nexus-button-hover)] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create First FAQ
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Categories Sidebar */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <DataCard title="Categories" icon={FolderOpen}>
            <div className="space-y-1">
              {categories.map((cat) => (
                <button
                  key={cat.name}
                  type="button"
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm text-[var(--nexus-text-secondary)] hover:bg-[var(--nexus-bg-secondary)] transition-colors"
                >
                  <span>{cat.name}</span>
                  <span className="text-xs text-[var(--nexus-text-tertiary)] bg-[var(--nexus-bg-secondary)] px-2 py-0.5 rounded-full">
                    {cat.count}
                  </span>
                </button>
              ))}
            </div>
          </DataCard>
        </motion.div>

        {/* FAQ List — Empty State */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-3"
        >
          <DataCard title="All FAQs" icon={HelpCircle}>
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-[var(--nexus-bg-secondary)] border border-[var(--nexus-card-border)] flex items-center justify-center mb-4">
                <HelpCircle className="w-8 h-8 text-[var(--nexus-text-tertiary)]" />
              </div>
              <h3 className="text-lg font-semibold text-[var(--nexus-text-primary)] mb-2">
                No FAQs yet
              </h3>
              <p className="text-sm text-[var(--nexus-text-secondary)] max-w-md mb-6">
                FAQs help your customers find answers quickly and give your AI employees the
                knowledge they need to respond accurately.
              </p>
              <button
                type="button"
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium bg-[var(--nexus-button-bg)] text-white hover:bg-[var(--nexus-button-hover)] transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create First FAQ
              </button>
            </div>
          </DataCard>
        </motion.div>
      </div>
    </div>
  );
}
