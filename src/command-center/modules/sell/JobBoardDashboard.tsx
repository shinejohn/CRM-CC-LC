import React from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { Briefcase, DollarSign, Clock, CheckCircle2, ArrowRight } from 'lucide-react';
import { PageHeader, MetricCard, DataCard, StatusBadge } from '@/components/shared';
import { useBusinessMode } from '@/hooks/useBusinessMode';

type JobStatus = 'quote_sent' | 'scheduled' | 'in_progress' | 'complete';
type Urgency = 'low' | 'medium' | 'high';

interface Job {
  id: string;
  client: string;
  service: string;
  price: number;
  status: JobStatus;
  urgency: Urgency;
}

const columnConfig: Record<JobStatus, { label: string }> = {
  quote_sent: { label: 'Quote Sent' },
  scheduled: { label: 'Scheduled' },
  in_progress: { label: 'In Progress' },
  complete: { label: 'Complete' },
};

const urgencyBadge: Record<Urgency, 'pending' | 'active' | 'overdue'> = {
  low: 'active',
  medium: 'pending',
  high: 'overdue',
};

const columns: JobStatus[] = ['quote_sent', 'scheduled', 'in_progress', 'complete'];

// TODO: wire to API — replace with real job data
const mockJobs: Job[] = [
  { id: '1', client: 'Maria Santos', service: 'Deep Clean', price: 350, status: 'quote_sent', urgency: 'low' },
  { id: '2', client: 'Tom Richardson', service: 'Kitchen Remodel', price: 4200, status: 'scheduled', urgency: 'high' },
  { id: '3', client: 'Jenny Park', service: 'Lawn Care', price: 120, status: 'in_progress', urgency: 'medium' },
  { id: '4', client: 'Carlos Vega', service: 'Plumbing Repair', price: 275, status: 'in_progress', urgency: 'high' },
  { id: '5', client: 'Lisa Chen', service: 'Interior Painting', price: 1800, status: 'scheduled', urgency: 'medium' },
  { id: '6', client: 'Kevin Obi', service: 'HVAC Service', price: 450, status: 'complete', urgency: 'low' },
  { id: '7', client: 'Diane Foster', service: 'Roof Inspection', price: 200, status: 'quote_sent', urgency: 'medium' },
  { id: '8', client: 'Raj Patel', service: 'Electrical Work', price: 650, status: 'complete', urgency: 'low' },
];

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
}

export function JobBoardDashboard() {
  const navigate = useNavigate();
  const { t } = useBusinessMode();

  const totalJobs = mockJobs.length;
  const pipelineValue = mockJobs.filter((j) => j.status !== 'complete').reduce((sum, j) => sum + j.price, 0);
  const inProgressCount = mockJobs.filter((j) => j.status === 'in_progress').length;
  const completedCount = mockJobs.filter((j) => j.status === 'complete').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('pipeline')}
        subtitle={`Track your ${t('deals').toLowerCase()} from quote to completion`}
        actions={
          <button
            onClick={() => navigate('/command-center/sell/customers')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-[var(--nexus-button-bg)] text-white hover:bg-[var(--nexus-button-hover)] transition-colors"
          >
            View {t('customers')}
            <ArrowRight className="w-4 h-4" />
          </button>
        }
      />

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label={`Total ${t('deals')}`} value={String(totalJobs)} icon={Briefcase} color="blue" />
        <MetricCard label="Pipeline Value" value={formatCurrency(pipelineValue)} icon={DollarSign} color="green" />
        <MetricCard label="In Progress" value={String(inProgressCount)} icon={Clock} color="amber" />
        <MetricCard label="Completed This Month" value={String(completedCount)} icon={CheckCircle2} color="purple" />
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {columns.map((status) => {
          const colJobs = mockJobs.filter((j) => j.status === status);
          const colTotal = colJobs.reduce((sum, j) => sum + j.price, 0);

          return (
            <motion.div
              key={status}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: columns.indexOf(status) * 0.05 }}
            >
              <DataCard
                title={columnConfig[status].label}
                subtitle={`${colJobs.length} ${t('deals').toLowerCase()} • ${formatCurrency(colTotal)}`}
              >
                <div className="space-y-3">
                  {colJobs.map((job) => (
                    <button
                      key={job.id}
                      onClick={() => navigate(`/command-center/sell/customers`)}
                      className="w-full text-left p-3 rounded-lg border border-[var(--nexus-card-border)] bg-[var(--nexus-bg-secondary)] hover:bg-[var(--nexus-card-bg-hover)] transition-colors"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-[var(--nexus-text-primary)]">{job.client}</p>
                        <StatusBadge status={urgencyBadge[job.urgency]} size="sm" />
                      </div>
                      <p className="text-xs text-[var(--nexus-text-secondary)]">{job.service}</p>
                      <p className="text-sm font-semibold text-[var(--nexus-accent-primary)] mt-2">{formatCurrency(job.price)}</p>
                    </button>
                  ))}
                  {colJobs.length === 0 && (
                    <p className="text-xs text-[var(--nexus-text-tertiary)] text-center py-4">No {t('deals').toLowerCase()}</p>
                  )}
                </div>
              </DataCard>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
