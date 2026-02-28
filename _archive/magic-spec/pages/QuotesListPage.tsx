import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Layout, List, CheckCircle2, Clock, TrendingUp, Loader2 } from 'lucide-react';
import { ProposalCard } from '../components/ProposalCard';
import { quotesApi, type Quote } from '../../src/services/crm/quotes-api';

const STATUS_COLUMNS = [
  { id: 'draft', title: 'DRAFT', color: 'border-slate-400' },
  { id: 'sent', title: 'SENT', color: 'border-blue-500' },
  { id: 'viewed', title: 'VIEWED', color: 'border-purple-500' },
  { id: 'accepted', title: 'ACCEPTED', color: 'border-emerald-500' },
];

function formatCurrency(value: string | number): string {
  const n = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(n)) return '$0';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(n);
}

export function QuotesListPage({
  onNavigate,
}: {
  onNavigate: (page: string, id?: string) => void;
}) {
  const [viewMode, setViewMode] = useState<'list' | 'board'>('board');
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    quotesApi
      .list({ per_page: 100 })
      .then((res) => {
        if (!cancelled) setQuotes(res.data ?? []);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load quotes');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredQuotes = useMemo(() => {
    if (!search) return quotes;
    const s = search.toLowerCase();
    return quotes.filter(
      (q) =>
        q.quote_number?.toLowerCase().includes(s) ||
        q.customer?.business_name?.toLowerCase().includes(s)
    );
  }, [quotes, search]);

  const byStatus = useMemo(() => {
    const map: Record<string, Quote[]> = { draft: [], sent: [], viewed: [], accepted: [] };
    for (const q of filteredQuotes) {
      const status = (q.status || 'draft').toLowerCase();
      const key = status === 'accepted' ? 'accepted' : status === 'sent' ? 'sent' : status === 'viewed' ? 'viewed' : 'draft';
      if (map[key]) map[key].push(q);
      else map.draft.push(q);
    }
    return map;
  }, [filteredQuotes]);

  const metrics = useMemo(() => {
    const openValue = quotes
      .filter((q) => !['accepted', 'rejected'].includes((q.status || '').toLowerCase()))
      .reduce((sum, q) => sum + (typeof q.total === 'number' ? q.total : parseFloat(String(q.total)) || 0), 0);
    const pending = quotes.filter((q) => (q.status || '').toLowerCase() === 'sent').length;
    const accepted = quotes.filter((q) => (q.status || '').toLowerCase() === 'accepted');
    const acceptedValue = accepted.reduce(
      (sum, q) => sum + (typeof q.total === 'number' ? q.total : parseFloat(String(q.total)) || 0),
      0
    );
    return {
      openValue,
      pending,
      acceptedCount: accepted.length,
      acceptedValue,
      conversionRate: quotes.length ? Math.round((accepted.length / quotes.length) * 100) : 0,
    };
  }, [quotes]);

  if (loading) {
    return (
      <div className="h-[calc(100vh-6rem)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-slate-600">Loading proposals...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-[calc(100vh-6rem)] flex flex-col items-center justify-center">
        <p className="text-red-600 mb-4">{error}</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-[calc(100vh-6rem)] flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6 shrink-0">
        <h1 className="text-2xl font-bold text-slate-900">📄 Proposals</h1>
        <button
          onClick={() => onNavigate('quote-new')}
          className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> New Proposal
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6 shrink-0">
        {[
          {
            label: 'Open Value',
            value: formatCurrency(metrics.openValue),
            subtext: `${filteredQuotes.length} proposals`,
            icon: TrendingUp,
            color: 'text-blue-600',
            bg: 'bg-blue-100',
          },
          {
            label: 'Pending Response',
            value: String(metrics.pending),
            subtext: 'Avg: 5 days',
            icon: Clock,
            color: 'text-amber-600',
            bg: 'bg-amber-100',
          },
          {
            label: 'Accepted This Month',
            value: String(metrics.acceptedCount),
            subtext: formatCurrency(metrics.acceptedValue),
            icon: CheckCircle2,
            color: 'text-emerald-600',
            bg: 'bg-emerald-100',
          },
          {
            label: 'Conversion Rate',
            value: `${metrics.conversionRate}%`,
            subtext: '▲ +5%',
            icon: TrendingUp,
            color: 'text-purple-600',
            bg: 'bg-purple-100',
          },
        ].map((metric, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${metric.bg}`}>
                <metric.icon className={`w-6 h-6 ${metric.color}`} />
              </div>
            </div>
            <p className="text-sm font-medium text-slate-500 mb-1">{metric.label}</p>
            <h3 className="text-2xl font-bold text-slate-900 mb-1">{metric.value}</h3>
            <p className="text-xs text-slate-500">{metric.subtext}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 mb-6 shrink-0">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('board')}
                className={`p-1.5 rounded ${viewMode === 'board' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <Layout className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg w-64">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search proposals..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent outline-none text-sm flex-1"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="flex gap-4 h-full min-w-max pb-4">
          {STATUS_COLUMNS.map((column) => {
            const list = byStatus[column.id] ?? [];
            const colValue = list.reduce(
              (sum, q) => sum + (typeof q.total === 'number' ? q.total : parseFloat(String(q.total)) || 0),
              0
            );
            return (
              <div key={column.id} className="w-80 flex flex-col h-full">
                <div className={`bg-slate-100 rounded-t-xl p-4 border-t-4 ${column.color} shrink-0 mb-3`}>
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="font-bold text-slate-700 text-sm">{column.title}</h3>
                    <span className="text-xs font-medium text-slate-500">{list.length} proposals</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-900">{formatCurrency(colValue)}</span>
                  </div>
                </div>
                <div className="space-y-3 overflow-y-auto flex-1 pr-2">
                  {list.map((quote) => (
                    <ProposalCard
                      key={quote.id}
                      id={quote.id}
                      quoteNumber={quote.quote_number}
                      company={quote.customer?.business_name || 'Unknown'}
                      amount={formatCurrency(quote.total)}
                      status={(quote.status || 'draft').toLowerCase()}
                      dueDate={
                        quote.valid_until
                          ? new Date(quote.valid_until).toLocaleDateString('en-US')
                          : '—'
                      }
                      onClick={() => onNavigate('quote-detail', quote.id)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
