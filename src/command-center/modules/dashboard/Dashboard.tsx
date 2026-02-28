import React from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import {
  Building2, Megaphone, TrendingUp, Package, BarChart3, Bot,
  ArrowRight, Clock, FileText, Users, CreditCard, Cpu,
  CheckCircle2, AlertCircle, Calendar,
} from 'lucide-react';
import { PageHeader, DataCard } from '@/components/shared';
import { useAuthStore } from '@/stores/authStore';
import { useBusinessMode } from '@/hooks/useBusinessMode';

interface VerbCardProps {
  verb: string;
  icon: React.ElementType;
  metrics: { label: string; value: string }[];
  action: { label: string; href: string };
  delay: number;
}

function VerbCard({ verb, icon: Icon, metrics, action, delay }: VerbCardProps) {
  const navigate = useNavigate();

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
            onClick={() => navigate(action.href)}
            className="flex items-center gap-2 text-sm font-medium text-[var(--nexus-accent-primary)] hover:underline transition-colors"
          >
            {action.label}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </DataCard>
    </motion.div>
  );
}

interface ActivityEntry {
  icon: React.ElementType;
  text: string;
  detail: string;
  time: string;
  href: string;
}

// TODO: wire to API — replace with real data from activity feed endpoint
const mockActivities: ActivityEntry[] = [
  { icon: FileText, text: 'Article published', detail: '"5 Tips for Local SEO"', time: '2 hours ago', href: '/command-center/attract/articles' },
  { icon: CreditCard, text: 'Invoice sent', detail: 'Acme Corp — $2,400', time: '4 hours ago', href: '/command-center/deliver/billing' },
  { icon: Users, text: 'New customer added', detail: 'TechStart Inc', time: '6 hours ago', href: '/command-center/sell/customers' },
  { icon: Cpu, text: 'AI Employee action', detail: 'Sarah drafted 3 social posts', time: '8 hours ago', href: '/command-center/automate' },
  { icon: CheckCircle2, text: 'Deal closed', detail: 'Enterprise License — $12,000', time: '1 day ago', href: '/command-center/sell/pipeline' },
  { icon: Calendar, text: 'Event upcoming', detail: '"Spring Launch Webinar"', time: '1 day ago', href: '/command-center/attract/events' },
  { icon: AlertCircle, text: 'Invoice overdue', detail: 'Beta Labs — $800', time: '2 days ago', href: '/command-center/deliver/billing' },
  { icon: FileText, text: 'Campaign launched', detail: '"Q1 Email Blast"', time: '2 days ago', href: '/command-center/attract/campaigns' },
  { icon: Users, text: 'Customer updated', detail: 'Meridian Corp — health score 92', time: '3 days ago', href: '/command-center/sell/customers' },
  { icon: Bot, text: 'Workflow completed', detail: 'Onboarding sequence — 5 emails sent', time: '3 days ago', href: '/command-center/automate/workflows' },
];

export function Dashboard() {
  const user = useAuthStore((s) => s.user);
  const { t } = useBusinessMode();
  const navigate = useNavigate();

  const isFree = user?.subscription_tier === 'free';

  // TODO: wire to API — replace mock metrics with real data
  const verbCards: VerbCardProps[] = [
    {
      verb: 'Define',
      icon: Building2,
      metrics: [
        { label: 'Profile completion', value: '78%' },
        { label: 'FAQ gaps', value: '2 unanswered' },
      ],
      action: { label: 'Complete FAQ', href: '/command-center/define/faq' },
      delay: 0.05,
    },
    {
      verb: 'Attract',
      icon: Megaphone,
      metrics: [
        { label: 'Articles live', value: '3' },
        { label: 'Events upcoming', value: '1' },
      ],
      action: { label: 'Create event', href: '/command-center/attract/events' },
      delay: 0.1,
    },
    {
      verb: 'Sell',
      icon: TrendingUp,
      metrics: [
        { label: t('customers'), value: '12' },
        { label: `Active ${t('deals').toLowerCase()}`, value: '4' },
      ],
      action: { label: `View ${t('pipeline')}`, href: '/command-center/sell/pipeline' },
      delay: 0.15,
    },
    {
      verb: 'Deliver',
      icon: Package,
      metrics: [
        { label: 'Active services', value: '5' },
        { label: 'Pending invoices', value: '1' },
      ],
      action: { label: 'View invoices', href: '/command-center/deliver/billing' },
      delay: 0.2,
    },
    {
      verb: 'Measure',
      icon: BarChart3,
      metrics: [
        { label: 'Total views', value: '847' },
        { label: 'Change this week', value: '+12%' },
      ],
      action: { label: 'Full report', href: '/command-center/measure/reports' },
      delay: 0.25,
    },
    {
      verb: 'Automate',
      icon: Bot,
      metrics: [
        { label: 'AI employees', value: '2' },
        { label: 'Actions this week', value: '14 posts' },
      ],
      action: { label: 'Configure team', href: '/command-center/automate' },
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
            {mockActivities.map((entry, i) => (
              <button
                key={i}
                onClick={() => navigate(entry.href)}
                className="w-full flex items-start gap-3 text-left group"
              >
                <div className="w-8 h-8 rounded-lg bg-[var(--nexus-bg-secondary)] flex items-center justify-center shrink-0 mt-0.5">
                  <entry.icon className="w-4 h-4 text-[var(--nexus-text-tertiary)] group-hover:text-[var(--nexus-accent-primary)] transition-colors" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--nexus-text-primary)] group-hover:text-[var(--nexus-accent-primary)] transition-colors">
                    {entry.text}
                  </p>
                  <p className="text-xs text-[var(--nexus-text-secondary)] truncate">
                    {entry.detail}
                  </p>
                </div>
                <span className="text-xs text-[var(--nexus-text-tertiary)] shrink-0 mt-0.5">
                  {entry.time}
                </span>
              </button>
            ))}
          </div>
        </DataCard>
      </motion.div>
    </div>
  );
}
