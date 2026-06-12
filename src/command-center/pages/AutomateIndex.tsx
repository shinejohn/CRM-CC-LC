import React from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { Bot, Cpu, Workflow, ArrowRight, Zap, Lock } from 'lucide-react';
import { PageHeader, MetricCard, DataCard, StatusBadge, LoadingState } from '@/components/shared';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { usePermission } from '@/hooks/usePermission';
import { usePersonalityList } from '@/hooks/usePersonalities';

export function AutomateIndex() {
  const navigate = useNavigate();
  const aiAccess = useFeatureAccess('ai_employees');
  const { allowed: canViewAI } = usePermission('view', 'ai-employees');
  const { data: personalities, isLoading } = usePersonalityList();

  const employees = (personalities ?? []).map((p) => ({
    id: p.id,
    name: p.name,
    title: (p as { description?: string; identity?: string }).description
      ?? (p as { identity?: string }).identity
      ?? 'AI Assistant',
    avatar: p.name[0]?.toUpperCase() ?? '?',
  }));

  const activeCount = employees.length;

  if (isLoading) {
    return <LoadingState variant="list" />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Automate"
        subtitle="Your AI workforce — employees, workflows, and automation rules"
      />

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="AI Employees" value={String(activeCount)} icon={Cpu} color="purple" />
        <MetricCard label="Actions This Week" value="—" icon={Zap} color="blue" />
        <MetricCard label="Active Workflows" value="—" icon={Workflow} color="green" />
        <MetricCard label="Automation Rules" value="—" icon={Bot} color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* AI Employee Roster */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <DataCard title="AI Employee Roster" icon={Cpu}
            headerAction={
              <button type="button" onClick={() => navigate('/command-center/automate/employees')} className="text-xs font-medium text-[var(--nexus-accent-primary)] hover:underline flex items-center gap-1">
                Configure <ArrowRight className="w-3 h-3" />
              </button>
            }
          >
            <div className="space-y-3 relative">
              {!aiAccess.enabled && (
                <div className="absolute inset-0 bg-[var(--nexus-card-bg)]/80 backdrop-blur-sm rounded-lg flex flex-col items-center justify-center z-10">
                  <Lock className="w-8 h-8 text-[var(--nexus-text-tertiary)] mb-3" />
                  <p className="text-sm font-semibold text-[var(--nexus-text-primary)]">{aiAccess.upgradeLabel}</p>
                  <p className="text-xs text-[var(--nexus-text-secondary)] mt-1">Unlock AI employees to automate your business</p>
                </div>
              )}

              {employees.length === 0 && (
                <p className="text-xs text-[var(--nexus-text-tertiary)] text-center py-6">No AI employees configured yet</p>
              )}

              {employees.map((emp) => (
                <div key={emp.id} className="flex items-center gap-3 p-3 rounded-lg border border-[var(--nexus-card-border)] bg-[var(--nexus-bg-secondary)]">
                  <div className="w-10 h-10 rounded-full bg-[var(--nexus-accent-primary)] flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {emp.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--nexus-text-primary)]">{emp.name}</p>
                    <p className="text-xs text-[var(--nexus-text-secondary)] truncate">{emp.title}</p>
                  </div>
                  <StatusBadge status="active" size="sm" />
                </div>
              ))}
            </div>
          </DataCard>
        </motion.div>

        {/* Recent AI Actions — populated by backend in a future sprint */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <DataCard title="Recent AI Actions" icon={Zap}>
            <p className="text-xs text-[var(--nexus-text-tertiary)] text-center py-6">Activity log coming soon</p>
          </DataCard>
        </motion.div>

        {/* Quick Links */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="lg:col-span-2">
          <DataCard title="Automation Tools">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { label: 'AI Employee Config', href: '/command-center/automate', icon: Cpu },
                { label: 'Workflow Builder', href: '/command-center/automate/workflows', icon: Workflow },
                { label: 'Process Manager', href: '/command-center/automate/processes', icon: Bot },
              ].map((action) => (
                <button
                  key={action.label}
                  onClick={() => canViewAI && navigate(action.href)}
                  disabled={!canViewAI}
                  className={`flex items-center gap-3 p-4 rounded-lg border border-[var(--nexus-card-border)] transition-colors group ${
                    canViewAI
                      ? 'bg-[var(--nexus-bg-secondary)] hover:bg-[var(--nexus-card-bg-hover)]'
                      : 'bg-[var(--nexus-bg-secondary)] opacity-50 cursor-not-allowed'
                  }`}
                >
                  <action.icon className="w-5 h-5 text-[var(--nexus-accent-primary)]" />
                  <span className="text-sm font-medium text-[var(--nexus-text-primary)]">{action.label}</span>
                  <ArrowRight className={`w-4 h-4 ml-auto transition-colors ${canViewAI ? 'text-[var(--nexus-text-tertiary)] group-hover:text-[var(--nexus-accent-primary)]' : 'text-[var(--nexus-text-tertiary)]'}`} />
                </button>
              ))}
            </div>
          </DataCard>
        </motion.div>
      </div>
    </div>
  );
}
