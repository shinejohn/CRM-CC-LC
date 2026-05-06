import { motion } from 'framer-motion';
import { Bot, Cpu, Plus } from 'lucide-react';
import { PageHeader, DataCard } from '@/components/shared';

interface AIEmployee {
  name: string;
  role: string;
  status: 'active' | 'available';
  description: string;
}

const employees: AIEmployee[] = [
  {
    name: 'Sarah',
    role: 'Content Strategist',
    status: 'active',
    description: 'Creates campaign strategies, writes content briefs, and manages your editorial calendar.',
  },
  {
    name: 'Open Slot',
    role: 'Sales Assistant',
    status: 'available',
    description: 'Qualifies leads, drafts follow-ups, and manages proposal workflows.',
  },
  {
    name: 'Open Slot',
    role: 'Customer Support',
    status: 'available',
    description: 'Handles FAQ responses, routes inquiries, and manages support tickets.',
  },
  {
    name: 'Open Slot',
    role: 'Analytics Analyst',
    status: 'available',
    description: 'Monitors campaign performance, generates reports, and surfaces insights.',
  },
];

export function AIEmployeesPage() {
  const activeCount = employees.filter((e) => e.status === 'active').length;
  const totalSlots = employees.length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Employees"
        subtitle="Your roster of AI-powered team members working around the clock"
        icon={Bot}
        actions={
          <button
            type="button"
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-[var(--nexus-button-bg)] text-white hover:bg-[var(--nexus-button-hover)] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Hire AI Employee
          </button>
        }
      />

      {/* Roster Summary */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <div className="flex items-center gap-6 p-4 rounded-xl border border-[var(--nexus-card-border)] bg-[var(--nexus-card-bg)]">
          <div className="flex items-center gap-3">
            <Cpu className="w-5 h-5 text-[var(--nexus-accent-primary)]" />
            <div>
              <p className="text-xs text-[var(--nexus-text-tertiary)]">Active Employees</p>
              <p className="text-lg font-bold text-[var(--nexus-text-primary)]">{activeCount} / {totalSlots}</p>
            </div>
          </div>
          <div className="h-8 w-px bg-[var(--nexus-divider)]" />
          <div>
            <p className="text-xs text-[var(--nexus-text-tertiary)]">Available Slots</p>
            <p className="text-lg font-bold text-[var(--nexus-text-primary)]">{totalSlots - activeCount}</p>
          </div>
        </div>
      </motion.div>

      {/* Employee Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {employees.map((employee, idx) => (
          <motion.div
            key={`${employee.role}-${idx}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + idx * 0.05 }}
          >
            <DataCard>
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${
                  employee.status === 'active'
                    ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800'
                    : 'bg-[var(--nexus-bg-secondary)] border-[var(--nexus-card-border)]'
                }`}>
                  <Bot className={`w-6 h-6 ${
                    employee.status === 'active'
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-[var(--nexus-text-tertiary)]'
                  }`} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="text-sm font-semibold text-[var(--nexus-text-primary)]">
                      {employee.name}
                    </h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      employee.status === 'active'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                        : 'bg-[var(--nexus-bg-secondary)] text-[var(--nexus-text-tertiary)] border border-[var(--nexus-card-border)]'
                    }`}>
                      {employee.status === 'active' ? 'Active' : 'Available'}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-[var(--nexus-accent-primary)] mb-2">
                    {employee.role}
                  </p>
                  <p className="text-xs text-[var(--nexus-text-secondary)] mb-3">
                    {employee.description}
                  </p>

                  {employee.status === 'active' ? (
                    <button
                      type="button"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--nexus-card-border)] text-[var(--nexus-text-secondary)] hover:bg-[var(--nexus-bg-secondary)] transition-colors"
                    >
                      <Cpu className="w-3.5 h-3.5" />
                      Manage
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--nexus-button-bg)] text-white hover:bg-[var(--nexus-button-hover)] transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Hire
                    </button>
                  )}
                </div>
              </div>
            </DataCard>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
