import React from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import {
  Building2, Megaphone, TrendingUp, Package, BarChart3, Bot,
  ArrowRight, Clock, FileText, Users, CreditCard, Cpu,
  CheckCircle2, AlertCircle, Calendar, Phone, Mail,
} from 'lucide-react';
import { PageHeader, DataCard } from '@/components/shared';
import { useAuthStore } from '@/stores/authStore';
import { useBusinessMode } from '@/hooks/useBusinessMode';
import { checkPermission, type Resource, type Role } from '@/hooks/usePermission';
import { useDashboard } from '../../hooks/useDashboard';
import type { Activity } from '@/types/command-center';

interface VerbCardProps {
  verb: string;
  icon: React.ElementType;
  metrics: { label: string; value: string }[];
  action: { label: string; href: string; resource: Resource };
  delay: number;
}

function VerbCard({ verb, icon: Icon, metrics, action, delay }: VerbCardProps) {
  const navigate = useNavigate();
  const userRole = (useAuthStore((s) => s.user?.role) ?? 'viewer') as Role;
  const canView = checkPermission(userRole, 'view', action.resource);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
    >
      <DataCard>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[var(--nexus-bg-secondary)] flex items-center justify-center">
              <Icon className="w-5 h-5 text-[var(--nexus-accent-primary)]" />
            </div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--nexus-text-tertiary)]">
              {verb}
            </h3>
          </div>

          <div className="space-y-2">
            {metrics.map((m, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-sm text-[var(--nexus-text-secondary)]">{m.label}</span>
                <span className="text-sm font-semibold text-[var(--nexus-text-primary)]">{m.value}</span>
              </div>
            ))}
          </div>

          <button
            onClick={() => canView && navigate(action.href)}
            disabled={!canView}
            className={`flex items-center gap-2 text-sm font-medium transition-colors ${
              canView
                ? 'text-[var(--nexus-accent-primary)] hover:underline'
                : 'text-[var(--nexus-text-tertiary)] cursor-not-allowed opacity-50'
            }`}
          >
            {action.label}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </DataCard>
    </motion.div>
  );
}

const ACTIVITY_ICON_MAP: Record<string, React.ElementType> = {
  phone_call: Phone,
  email: Mail,
  sms: Mail,
  meeting: Calendar,
  note: FileText,
  task: CheckCircle2,
  deal_update: TrendingUp,
  invoice: CreditCard,
  content: FileText,
  customer_added: Users,
  ai_action: Cpu,
  workflow: Bot,
  event: Calendar,
  alert: AlertCircle,
};

const ACTIVITY_HREF_MAP: Record<string, string> = {
  phone_call: '/command-center/sell/customers',
  email: '/command-center/sell/customers',
  sms: '/command-center/sell/customers',
  meeting: '/command-center/sell/customers',
  note: '/command-center/sell/customers',
  task: '/command-center/sell/pipeline',
  deal_update: '/command-center/sell/pipeline',
  invoice: '/command-center/deliver/billing',
  content: '/command-center/attract/articles',
  customer_added: '/command-center/sell/customers',
  ai_action: '/command-center/automate',
  workflow: '/command-center/automate/workflows',
  event: '/command-center/attract/events',
  alert: '/command-center/deliver/billing',
};

function formatRelativeTime(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function activityIcon(type: string): React.ElementType {
  return ACTIVITY_ICON_MAP[type] ?? FileText;
}

function activityHref(type: string): string {
  return ACTIVITY_HREF_MAP[type] ?? '/command-center';
}

export function Dashboard() {
  const user = useAuthStore((s) => s.user);
  const { t } = useBusinessMode();
  const navigate = useNavigate();
  const { activities, isLoading: activitiesLoading } = useDashboard();

  const isFree = user?.subscription_tier === 'free';

  const verbCards: VerbCardProps[] = [
    {
      verb: 'Define',
      icon: Building2,
      metrics: [
        { label: 'Profile completion', value: '78%' },
        { label: 'FAQ gaps', value: '2 unanswered' },
      ],
      action: { label: 'Complete FAQ', href: '/command-center/define/faq', resource: 'settings' },
      delay: 0.05,
    },
    {
      verb: 'Attract',
      icon: Megaphone,
      metrics: [
        { label: 'Articles live', value: '3' },
        { label: 'Events upcoming', value: '1' },
      ],
      action: { label: 'Create event', href: '/command-center/attract/events', resource: 'content' },
      delay: 0.1,
    },
    {
      verb: 'Sell',
      icon: TrendingUp,
      metrics: [
        { label: t('customers'), value: '12' },
        { label: `Active ${t('deals').toLowerCase()}`, value: '4' },
      ],
      action: { label: `View ${t('pipeline')}`, href: '/command-center/sell/pipeline', resource: 'deals' },
      delay: 0.15,
    },
    {
      verb: 'Deliver',
      icon: Package,
      metrics: [
        { label: 'Active services', value: '5' },
        { label: 'Pending invoices', value: '1' },
      ],
      action: { label: 'View invoices', href: '/command-center/deliver/billing', resource: 'billing' },
      delay: 0.2,
    },
    {
      verb: 'Measure',
      icon: BarChart3,
      metrics: [
        { label: 'Total views', value: '847' },
        { label: 'Change this week', value: '+12%' },
      ],
      action: { label: 'Full report', href: '/command-center/measure/reports', resource: 'analytics' },
      delay: 0.25,
    },
    {
      verb: 'Automate',
      icon: Bot,
      metrics: [
        { label: 'AI employees', value: '2' },
        { label: 'Actions this week', value: '14 posts' },
      ],
      action: { label: 'Configure team', href: '/command-center/automate', resource: 'ai-employees' },
      delay: 0.3,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Bar */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-[var(--nexus-text-primary)]">
            Welcome back{user?.name ? `, ${user.name}` : ''}
          </h1>
          <p className="text-sm text-[var(--nexus-text-secondary)] mt-1">
            Here&apos;s what&apos;s happening with your business today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isFree && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[var(--nexus-bg-secondary)] text-[var(--nexus-accent-primary)] border border-[var(--nexus-card-border)]">
              <Clock className="w-3.5 h-3.5" />
              Free Trial — 14 days left
            </span>
          )}
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[var(--nexus-bg-secondary)] text-[var(--nexus-text-secondary)] border border-[var(--nexus-card-border)]">
            $4,250 this month
          </span>
        </div>
      </motion.div>

      {/* Six Verb Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {verbCards.map((card) => (
          <VerbCard key={card.verb} {...card} />
        ))}
      </div>

      {/* Activity Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <DataCard title="Recent Activity" icon={Clock} subtitle="Last 10 actions across all systems">
          <div className="space-y-4">
            {activitiesLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-start gap-3 animate-pulse">
                  <div className="w-8 h-8 rounded-lg bg-[var(--nexus-bg-secondary)] shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 bg-[var(--nexus-bg-secondary)] rounded w-2/3" />
                    <div className="h-2.5 bg-[var(--nexus-bg-secondary)] rounded w-1/2" />
                  </div>
                </div>
              ))
            ) : activities.length === 0 ? (
              <p className="text-sm text-[var(--nexus-text-tertiary)] text-center py-4">No recent activity yet.</p>
            ) : (
              activities.map((entry: Activity) => {
                const Icon = activityIcon(entry.type);
                return (
                  <button
                    key={entry.id}
                    type="button"
                    onClick={() => navigate(activityHref(entry.type))}
                    className="w-full flex items-start gap-3 text-left group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[var(--nexus-bg-secondary)] flex items-center justify-center shrink-0 mt-0.5">
                      <Icon className="w-4 h-4 text-[var(--nexus-text-tertiary)] group-hover:text-[var(--nexus-accent-primary)] transition-colors" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--nexus-text-primary)] group-hover:text-[var(--nexus-accent-primary)] transition-colors">
                        {entry.title}
                      </p>
                      <p className="text-xs text-[var(--nexus-text-secondary)] truncate">
                        {entry.description}
                      </p>
                    </div>
                    <span className="text-xs text-[var(--nexus-text-tertiary)] shrink-0 mt-0.5">
                      {formatRelativeTime(entry.timestamp)}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </DataCard>
      </motion.div>
    </div>
  );
}
