import React from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { Bot, Cpu, Workflow, ArrowRight, Zap, Lock } from 'lucide-react';
import { PageHeader, MetricCard, DataCard, StatusBadge } from '@/components/shared';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';

interface AIEmployee {
  name: string;
  title: string;
  avatar: string;
  status: 'active' | 'available' | 'not_hired';
  recentAction?: string;
}

// TODO: wire to API — replace with real AI employee data
const mockEmployees: AIEmployee[] = [
  { name: 'Sarah', title: 'Content Strategist', avatar: 'S', status: 'active', recentAction: 'Drafted 3 social posts' },
  { name: 'Alex', title: 'Lead Qualifier', avatar: 'A', status: 'active', recentAction: 'Qualified 2 inbound leads' },
  { name: 'Maya', title: 'Customer Success', avatar: 'M', status: 'available' },
  { name: 'Jordan', title: 'SEO Specialist', avatar: 'J', status: 'not_hired' },
];

const mockRecentActions = [
  { employee: 'Sarah', action: 'Published blog post "Spring Marketing Tips"', time: '2 hours ago' },
  { employee: 'Alex', action: 'Sent follow-up email to TechStart Inc', time: '4 hours ago' },
  { employee: 'Sarah', action: 'Scheduled 5 social posts for next week', time: '6 hours ago' },
  { employee: 'Alex', action: 'Updated lead score for Meridian Corp', time: '1 day ago' },
  { employee: 'Sarah', action: 'Generated monthly content calendar', time: '1 day ago' },
];

const statusBadgeMap: Record<string, 'active' | 'pending' | 'inactive'> = {
  active: 'active',
  available: 'pending',
  not_hired: 'inactive',
};

export function AutomateIndex() {
  const navigate = useNavigate();
  const aiAccess = useFeatureAccess('ai_employees');

  const activeCount = mockEmployees.filter((e) => e.status === 'active').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Automate"
        subtitle="Your AI workforce — employees, workflows, and automation rules"
      />

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="AI Employees" value={String(activeCount)} icon={Cpu} color="purple" />
        <MetricCard label="Actions This Week" value="14" icon={Zap} color="blue" />
        <MetricCard label="Active Workflows" value="3" icon={Workflow} color="green" />
        <MetricCard label="Automation Rules" value="7" icon={Bot} color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* AI Employee Roster */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <DataCard title="AI Employee Roster" icon={Cpu}
            headerAction={
              <button onClick={() => navigate('/command-center/automate')} className="text-xs font-medium text-[var(--nexus-accent-primary)] hover:underline flex items-center gap-1">
                Configure <ArrowRight className="w-3 h-3" />
              </button>
            }
          >
            <div className="space-y-3 relative">
              {/* Upgrade overlay for free tier */}
              {!aiAccess.enabled && (
                <div className="absolute inset-0 bg-[var(--nexus-card-bg)]/80 backdrop-blur-sm rounded-lg flex flex-col items-center justify-center z-10">
                  <Lock className="w-8 h-8 text-[var(--nexus-text-tertiary)] mb-3" />
                  <p className="text-sm font-semibold text-[var(--nexus-text-primary)]">{aiAccess.upgradeLabel}</p>
                  <p className="text-xs text-[var(--nexus-text-secondary)] mt-1">Unlock AI employees to automate your business</p>
                </div>
              )}

              {mockEmployees.map((emp) => (
                <div key={emp.name} className="flex items-center gap-3 p-3 rounded-lg border border-[var(--nexus-card-border)] bg-[var(--nexus-bg-secondary)]">
                  <div className="w-10 h-10 rounded-full bg-[var(--nexus-accent-primary)] flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {emp.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--nexus-text-primary)]">{emp.name}</p>
                    <p className="text-xs text-[var(--nexus-text-secondary)] truncate">{emp.title}</p>
                  </div>
                  <StatusBadge status={statusBadgeMap[emp.status]} size="sm" />
                </div>
              ))}
            </div>
          </DataCard>
        </motion.div>

        {/* Recent AI Actions */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <DataCard title="Recent AI Actions" icon={Zap}>
            <div className="space-y-3">
              {mockRecentActions.map((action, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-[var(--nexus-bg-secondary)] border border-[var(--nexus-card-border)] flex items-center justify-center text-xs font-bold text-[var(--nexus-accent-primary)] shrink-0 mt-0.5">
                    {action.employee[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[var(--nexus-text-primary)]">
                      <span className="font-medium">{action.employee}</span> {action.action}
                    </p>
                    <p className="text-xs text-[var(--nexus-text-tertiary)]">{action.time}</p>
                  </div>
                </div>
              ))}
            </div>
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
                  onClick={() => navigate(action.href)}
                  className="flex items-center gap-3 p-4 rounded-lg border border-[var(--nexus-card-border)] bg-[var(--nexus-bg-secondary)] hover:bg-[var(--nexus-card-bg-hover)] transition-colors group"
                >
                  <action.icon className="w-5 h-5 text-[var(--nexus-accent-primary)]" />
                  <span className="text-sm font-medium text-[var(--nexus-text-primary)]">{action.label}</span>
                  <ArrowRight className="w-4 h-4 ml-auto text-[var(--nexus-text-tertiary)] group-hover:text-[var(--nexus-accent-primary)] transition-colors" />
                </button>
              ))}
            </div>
          </DataCard>
        </motion.div>
      </div>
    </div>
  );
}
