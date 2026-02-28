import React from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { FileText, Calendar, Layers, Stethoscope, ArrowRight, TrendingUp } from 'lucide-react';
import { PageHeader, MetricCard, DataCard, StatusBadge } from '@/components/shared';

// TODO: wire to API — replace with real content/campaign data
const mockArticles = [
  { title: '5 Tips for Local SEO', date: 'Feb 25', status: 'active' as const },
  { title: 'Spring Marketing Guide', date: 'Feb 20', status: 'active' as const },
  { title: 'Customer Success Stories', date: 'Feb 15', status: 'draft' as const },
];

const mockCampaigns = [
  { name: 'Q1 Email Blast', type: 'Email', progress: 75, status: 'active' as const },
  { name: 'Social Spring Push', type: 'Social', progress: 40, status: 'active' as const },
  { name: 'Local SEO Campaign', type: 'SEO', progress: 100, status: 'completed' as const },
];

const mockEvents = [
  { name: 'Spring Launch Webinar', date: 'Mar 5', attendees: 45 },
  { name: 'Community Meetup', date: 'Mar 12', attendees: 22 },
];

export function AttractIndex() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attract"
        subtitle="Your marketing activity at a glance — content, campaigns, and events"
      />

      {/* Top Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Articles Published" value={String(mockArticles.filter((a) => a.status === 'active').length)} icon={FileText} color="blue" />
        <MetricCard label="Events Upcoming" value={String(mockEvents.length)} icon={Calendar} color="green" />
        <MetricCard label="Active Campaigns" value={String(mockCampaigns.filter((c) => c.status === 'active').length)} icon={Layers} color="purple" />
        <MetricCard label="Marketing Score" value="72/100" icon={TrendingUp} color="amber" change={{ value: 8, direction: 'up' }} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Content Summary */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <DataCard title="Recent Articles" icon={FileText}
            headerAction={
              <button onClick={() => navigate('/command-center/attract/articles')} className="text-xs font-medium text-[var(--nexus-accent-primary)] hover:underline flex items-center gap-1">
                View all <ArrowRight className="w-3 h-3" />
              </button>
            }
          >
            <div className="space-y-3">
              {mockArticles.map((a, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-[var(--nexus-card-border)] bg-[var(--nexus-bg-secondary)]">
                  <div>
                    <p className="text-sm font-medium text-[var(--nexus-text-primary)]">{a.title}</p>
                    <p className="text-xs text-[var(--nexus-text-secondary)]">{a.date}</p>
                  </div>
                  <StatusBadge status={a.status} size="sm" />
                </div>
              ))}
            </div>
          </DataCard>
        </motion.div>

        {/* Campaigns */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <DataCard title="Campaign Status" icon={Layers}
            headerAction={
              <button onClick={() => navigate('/command-center/attract/campaigns')} className="text-xs font-medium text-[var(--nexus-accent-primary)] hover:underline flex items-center gap-1">
                View all <ArrowRight className="w-3 h-3" />
              </button>
            }
          >
            <div className="space-y-3">
              {mockCampaigns.map((c, i) => (
                <div key={i} className="p-3 rounded-lg border border-[var(--nexus-card-border)] bg-[var(--nexus-bg-secondary)]">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-[var(--nexus-text-primary)]">{c.name}</p>
                    <StatusBadge status={c.status} size="sm" />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-[var(--nexus-bg-secondary)]">
                      <div className="h-full rounded-full bg-[var(--nexus-accent-primary)]" style={{ width: `${c.progress}%` }} />
                    </div>
                    <span className="text-xs text-[var(--nexus-text-tertiary)]">{c.progress}%</span>
                  </div>
                </div>
              ))}
            </div>
          </DataCard>
        </motion.div>

        {/* Events */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <DataCard title="Upcoming Events" icon={Calendar}
            headerAction={
              <button onClick={() => navigate('/command-center/attract/events')} className="text-xs font-medium text-[var(--nexus-accent-primary)] hover:underline flex items-center gap-1">
                View all <ArrowRight className="w-3 h-3" />
              </button>
            }
          >
            <div className="space-y-3">
              {mockEvents.map((e, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-[var(--nexus-card-border)] bg-[var(--nexus-bg-secondary)]">
                  <div>
                    <p className="text-sm font-medium text-[var(--nexus-text-primary)]">{e.name}</p>
                    <p className="text-xs text-[var(--nexus-text-secondary)]">{e.date}</p>
                  </div>
                  <span className="text-xs text-[var(--nexus-text-tertiary)]">{e.attendees} RSVPs</span>
                </div>
              ))}
            </div>
          </DataCard>
        </motion.div>

        {/* Quick Actions */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <DataCard title="Quick Actions" icon={Stethoscope}>
            <div className="space-y-3">
              {[
                { label: 'Write Article', href: '/command-center/attract/articles' },
                { label: 'Create Event', href: '/command-center/attract/events' },
                { label: 'Run Campaign', href: '/command-center/attract/campaigns' },
                { label: 'Marketing Diagnostic', href: '/command-center/attract/diagnostic' },
              ].map((action) => (
                <button
                  key={action.label}
                  onClick={() => navigate(action.href)}
                  className="w-full flex items-center justify-between p-3 rounded-lg border border-[var(--nexus-card-border)] bg-[var(--nexus-bg-secondary)] hover:bg-[var(--nexus-card-bg-hover)] transition-colors group"
                >
                  <span className="text-sm font-medium text-[var(--nexus-text-primary)]">{action.label}</span>
                  <ArrowRight className="w-4 h-4 text-[var(--nexus-text-tertiary)] group-hover:text-[var(--nexus-accent-primary)] transition-colors" />
                </button>
              ))}
            </div>
          </DataCard>
        </motion.div>
      </div>
    </div>
  );
}
