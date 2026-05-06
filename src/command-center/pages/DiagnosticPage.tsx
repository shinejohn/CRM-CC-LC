import { motion } from 'framer-motion';
import { Stethoscope, ArrowRight } from 'lucide-react';
import { PageHeader, DataCard } from '@/components/shared';

const diagnosticAreas = [
  { label: 'Online Presence', description: 'Website, social media, and directory listings' },
  { label: 'Content Strategy', description: 'Blog posts, articles, and educational content' },
  { label: 'Lead Generation', description: 'Forms, CTAs, and conversion funnels' },
  { label: 'Email Marketing', description: 'List health, open rates, and automation' },
  { label: 'Reputation', description: 'Reviews, testimonials, and brand sentiment' },
];

export function DiagnosticPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Marketing Diagnostic"
        subtitle="Identify gaps and opportunities in your marketing strategy"
        icon={Stethoscope}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Start Diagnostic Card */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <DataCard title="Run a Diagnostic" icon={Stethoscope}>
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 rounded-lg bg-[var(--nexus-bg-secondary)] border border-[var(--nexus-card-border)]">
                <div className="w-12 h-12 rounded-xl bg-[var(--nexus-bg-secondary)] border border-[var(--nexus-card-border)] flex items-center justify-center shrink-0">
                  <Stethoscope className="w-6 h-6 text-[var(--nexus-accent-primary)]" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[var(--nexus-text-primary)] mb-1">
                    Identify marketing gaps
                  </p>
                  <p className="text-xs text-[var(--nexus-text-secondary)]">
                    Our diagnostic reviews your online presence, content strategy, lead generation,
                    email health, and reputation to surface actionable recommendations.
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-[var(--nexus-button-bg)] text-white hover:bg-[var(--nexus-button-hover)] transition-colors"
              >
                Start Diagnostic
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </DataCard>
        </motion.div>

        {/* Areas Covered */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <DataCard title="Areas Covered" icon={Stethoscope} subtitle="What the diagnostic evaluates">
            <div className="space-y-3">
              {diagnosticAreas.map((area, idx) => (
                <div
                  key={area.label}
                  className="flex items-center gap-3 p-3 rounded-lg border border-[var(--nexus-card-border)] bg-[var(--nexus-bg-secondary)]"
                >
                  <div className="w-8 h-8 rounded-lg bg-[var(--nexus-card-bg)] border border-[var(--nexus-card-border)] flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-[var(--nexus-accent-primary)]">{idx + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--nexus-text-primary)]">{area.label}</p>
                    <p className="text-xs text-[var(--nexus-text-tertiary)]">{area.description}</p>
                  </div>
                  <div className="px-2 py-0.5 rounded-full bg-[var(--nexus-bg-secondary)] border border-[var(--nexus-card-border)]">
                    <span className="text-xs text-[var(--nexus-text-tertiary)]">Pending</span>
                  </div>
                </div>
              ))}
            </div>
          </DataCard>
        </motion.div>
      </div>
    </div>
  );
}
