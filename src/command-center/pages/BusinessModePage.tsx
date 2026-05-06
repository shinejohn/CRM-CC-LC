import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, Store, UtensilsCrossed, Briefcase, Settings } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { PageHeader, DataCard } from '@/components/shared';

interface BusinessMode {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  features: string[];
}

const businessModes: BusinessMode[] = [
  {
    id: 'service',
    name: 'Service Business',
    description: 'Appointment-based or project-based services like salons, agencies, or consultants',
    icon: Building2,
    features: ['Appointment scheduling', 'Service catalog', 'Client portal'],
  },
  {
    id: 'retail',
    name: 'Retail',
    description: 'Product-focused businesses with inventory, e-commerce, and point-of-sale',
    icon: Store,
    features: ['Product catalog', 'Inventory tracking', 'Order management'],
  },
  {
    id: 'restaurant',
    name: 'Restaurant',
    description: 'Food service businesses with menus, reservations, and delivery workflows',
    icon: UtensilsCrossed,
    features: ['Menu management', 'Reservation system', 'Online ordering'],
  },
  {
    id: 'professional',
    name: 'Professional Services',
    description: 'Knowledge-based firms like law, accounting, or engineering practices',
    icon: Briefcase,
    features: ['Case management', 'Time tracking', 'Document management'],
  },
];

export function BusinessModePage() {
  const [selectedMode, setSelectedMode] = useState<string>('service');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Business Mode"
        subtitle="Choose how your platform is configured to match your business type"
        icon={Settings}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {businessModes.map((mode, index) => {
          const isSelected = selectedMode === mode.id;
          const ModeIcon = mode.icon;

          return (
            <motion.div
              key={mode.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <DataCard
                className={
                  isSelected
                    ? 'ring-2 ring-[var(--nexus-accent-primary)] border-[var(--nexus-accent-primary)]'
                    : ''
                }
              >
                <button
                  type="button"
                  onClick={() => setSelectedMode(mode.id)}
                  className="w-full text-left"
                  aria-label={`Select ${mode.name} business mode`}
                >
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                          isSelected
                            ? 'bg-[var(--nexus-accent-primary)] text-white'
                            : 'bg-[var(--nexus-bg-secondary)] border border-[var(--nexus-card-border)] text-[var(--nexus-text-tertiary)]'
                        }`}
                      >
                        <ModeIcon className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="text-sm font-semibold text-[var(--nexus-text-primary)]">
                            {mode.name}
                          </h3>
                          {isSelected && (
                            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                              Active
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[var(--nexus-text-secondary)]">
                          {mode.description}
                        </p>
                      </div>
                    </div>

                    {/* Features list */}
                    <div className="space-y-2 pl-16">
                      {mode.features.map((feature) => (
                        <div key={feature} className="flex items-center gap-2">
                          <div
                            className={`w-1.5 h-1.5 rounded-full ${
                              isSelected
                                ? 'bg-[var(--nexus-accent-primary)]'
                                : 'bg-[var(--nexus-text-tertiary)]'
                            }`}
                          />
                          <span className="text-xs text-[var(--nexus-text-secondary)]">
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Selection indicator */}
                    <div className="flex items-center justify-center">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                          isSelected
                            ? 'border-[var(--nexus-accent-primary)] bg-[var(--nexus-accent-primary)]'
                            : 'border-[var(--nexus-text-tertiary)]'
                        }`}
                        role="radio"
                        aria-checked={isSelected}
                        aria-label={mode.name}
                      >
                        {isSelected && (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              </DataCard>
            </motion.div>
          );
        })}
      </div>

      {/* Save bar */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="flex items-center justify-between p-4 rounded-xl bg-[var(--nexus-card-bg)] border border-[var(--nexus-card-border)] shadow-[var(--nexus-card-shadow)]"
      >
        <p className="text-sm text-[var(--nexus-text-secondary)]">
          Changing your business mode will adjust available features and default workflows.
        </p>
        <button
          type="button"
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium bg-[var(--nexus-button-bg)] text-white hover:bg-[var(--nexus-button-hover)] transition-colors shrink-0"
        >
          Save Mode
        </button>
      </motion.div>
    </div>
  );
}
