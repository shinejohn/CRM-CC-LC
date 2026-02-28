import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Layout, List, Calendar, AlertTriangle, Clock, CheckCircle2, Send } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { MetricCard } from '../components/shared';

interface Job {
  id: string;
  client: string;
  service: string;
  price: number;
  status: string;
  urgency: 'low' | 'medium' | 'high';
}

interface Column {
  id: string;
  title: string;
  color: string;
  jobs: Job[];
}

// Column border colors are semantic — they identify pipeline stages
const MOCK_COLUMNS: Column[] = [
  {
    id: 'quote',
    title: 'QUOTE SENT',
    color: 'border-blue-500',
    jobs: [
      { id: 'q1', client: 'Smith', service: 'Water htr', price: 2400, status: '5 days', urgency: 'low' },
      { id: 'q2', client: 'Davis', service: 'Bathroom', price: 5800, status: '11 days', urgency: 'medium' },
    ],
  },
  {
    id: 'scheduled',
    title: 'SCHEDULED',
    color: 'border-indigo-500',
    jobs: [
      { id: 's1', client: 'Johnson', service: 'Emergency', price: 175, status: 'Today 2pm', urgency: 'high' },
      { id: 's2', client: 'ABC Corp', service: 'Maint.', price: 250, status: 'Tom. 9am', urgency: 'low' },
    ],
  },
  {
    id: 'progress',
    title: 'IN PROGRESS',
    color: 'border-purple-500',
    jobs: [
      { id: 'p1', client: 'Chen', service: 'Pipe fix', price: 280, status: 'Started', urgency: 'medium' },
    ],
  },
  {
    id: 'complete',
    title: 'COMPLETE',
    color: 'border-emerald-500',
    jobs: [
      { id: 'c1', client: 'Adams', service: 'Inspection', price: 75, status: 'Done', urgency: 'low' },
      { id: 'c2', client: 'Brown', service: 'Kitchen', price: 320, status: 'Done', urgency: 'low' },
    ],
  },
];

// Semantic urgency colors — intentional, these indicate priority levels
const urgencyStyles = {
  low: 'bg-[var(--nexus-bg-secondary)] text-[var(--nexus-text-secondary)]',
  medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  high: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const UrgencyIcon = ({ urgency }: { urgency: 'low' | 'medium' | 'high' }) => {
  if (urgency === 'high') return <AlertTriangle className="w-3.5 h-3.5" />;
  if (urgency === 'medium') return <Clock className="w-3.5 h-3.5" />;
  return <CheckCircle2 className="w-3.5 h-3.5" />;
};

function getColumnTotal(jobs: Job[]): string {
  const total = jobs.reduce((sum, j) => sum + j.price, 0);
  return `$${total.toLocaleString()}`;
}

export default function AITeamPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'board' | 'list' | 'calendar'>('board');

  const filteredColumns = MOCK_COLUMNS.map(col => ({
    ...col,
    jobs: col.jobs.filter(
      j =>
        j.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
        j.service.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  }));

  const totalJobs = MOCK_COLUMNS.reduce((sum, col) => sum + col.jobs.length, 0);
  const totalValue = MOCK_COLUMNS.reduce(
    (sum, col) => sum + col.jobs.reduce((s, j) => s + j.price, 0),
    0
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="h-full flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-[var(--nexus-text-primary)]">Job Board</h1>
          <p className="text-sm text-[var(--nexus-text-secondary)] mt-1">
            Track jobs across your AI team pipeline
          </p>
        </div>
        <button className="px-4 py-2 bg-[var(--nexus-accent-primary)] text-white font-semibold rounded-lg hover:bg-[var(--nexus-button-hover)] transition-colors shadow-sm flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" /> New Quote
        </button>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 shrink-0">
        <MetricCard label="Total Jobs" value={totalJobs} icon={Layout} color="sky" />
        <MetricCard label="Pipeline Value" value={`$${totalValue.toLocaleString()}`} icon={Send} color="emerald" />
        <MetricCard label="In Progress" value={MOCK_COLUMNS[2].jobs.length} icon={Clock} color="purple" />
        <MetricCard label="Completed" value={MOCK_COLUMNS[3].jobs.length} icon={CheckCircle2} color="green" />
      </div>

      {/* Toolbar */}
      <div className="bg-[var(--nexus-card-bg)] rounded-xl shadow-sm border border-[var(--nexus-card-border)] p-4 mb-6 shrink-0">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-[var(--nexus-bg-secondary)] rounded-lg p-1">
              {[
                { mode: 'board' as const, icon: Layout },
                { mode: 'list' as const, icon: List },
                { mode: 'calendar' as const, icon: Calendar },
              ].map(({ mode, icon: Icon }) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`p-1.5 rounded transition-colors ${
                    viewMode === mode
                      ? 'bg-[var(--nexus-card-bg)] shadow-sm text-[var(--nexus-accent-primary)]'
                      : 'text-[var(--nexus-text-secondary)] hover:text-[var(--nexus-text-primary)]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 bg-[var(--nexus-bg-secondary)] rounded-lg w-64">
              <Search className="w-4 h-4 text-[var(--nexus-text-tertiary)]" />
              <input
                type="text"
                placeholder="Search jobs..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="bg-transparent outline-none text-sm flex-1 text-[var(--nexus-text-primary)] placeholder:text-[var(--nexus-text-tertiary)]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="flex gap-4 h-full min-w-max pb-4">
          {filteredColumns.map(column => (
            <div key={column.id} className="w-80 flex flex-col h-full">
              {/* Column Header */}
              <div
                className={`bg-[var(--nexus-bg-secondary)] rounded-t-xl p-4 border-t-4 ${column.color} shrink-0`}
              >
                <div className="flex justify-between items-center mb-1">
                  <h3 className="font-bold text-[var(--nexus-text-secondary)] text-sm">
                    {column.title}
                  </h3>
                  <span className="text-xs font-medium text-[var(--nexus-text-secondary)]">
                    {column.jobs.length} jobs
                  </span>
                </div>
                <span className="font-bold text-[var(--nexus-text-primary)]">
                  {getColumnTotal(column.jobs)}
                </span>
              </div>

              {/* Jobs List */}
              <div className="bg-[var(--nexus-bg-secondary)]/50 border-x border-b border-[var(--nexus-card-border)] rounded-b-xl p-3 flex-1 overflow-y-auto space-y-3">
                {column.jobs.map(job => (
                  <Card
                    key={job.id}
                    className="cursor-pointer hover:shadow-md transition-shadow bg-[var(--nexus-card-bg)] border-[var(--nexus-card-border)]"
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-[var(--nexus-text-primary)] text-sm">
                          {job.client}
                        </h4>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${urgencyStyles[job.urgency]}`}
                        >
                          <UrgencyIcon urgency={job.urgency} />
                          {job.urgency}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--nexus-text-secondary)] mb-2">{job.service}</p>
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-[var(--nexus-text-primary)] text-sm">
                          ${job.price.toLocaleString()}
                        </span>
                        <span className="text-xs text-[var(--nexus-text-secondary)]">{job.status}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                <button className="w-full py-2 border-2 border-dashed border-[var(--nexus-card-border)] rounded-lg text-[var(--nexus-text-tertiary)] hover:border-[var(--nexus-accent-primary)] hover:text-[var(--nexus-accent-primary)] hover:bg-[var(--nexus-bg-secondary)] transition-all text-sm font-medium flex items-center justify-center gap-1">
                  <Plus className="w-4 h-4" /> New Job
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
