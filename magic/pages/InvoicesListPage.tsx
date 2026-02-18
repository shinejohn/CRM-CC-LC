import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Search,
  Layout,
  List,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Clock,
  Loader2,
} from 'lucide-react';
import { InvoiceCard } from '../components/InvoiceCard';
import { invoicesApi, type Invoice } from '../../src/services/crm/invoices-api';

function formatCurrency(value: string | number): string {
  const n = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(n)) return '$0';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(n);
}

function getInvoiceStatus(inv: Invoice): 'draft' | 'sent' | 'overdue' | 'paid' | 'partial' {
  if (inv.status === 'paid') return 'paid';
  if (inv.status === 'draft') return 'draft';
  const balance = typeof inv.balance_due === 'number' ? inv.balance_due : parseFloat(String(inv.balance_due)) || 0;
  const total = typeof inv.total === 'number' ? inv.total : parseFloat(String(inv.total)) || 0;
  if (balance > 0 && inv.due_date && new Date(inv.due_date) < new Date()) return 'overdue';
  if (balance > 0 && balance < total) return 'partial';
  return 'sent';
}

function daysOverdue(dueDate?: string): number {
  if (!dueDate) return 0;
  const due = new Date(dueDate);
  const now = new Date();
  if (due >= now) return 0;
  return Math.floor((now.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
}

export function InvoicesListPage({
  onNavigate,
}: {
  onNavigate: (page: string, id?: string) => void;
}) {
  const [viewMode, setViewMode] = useState<'list' | 'board'>('list');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    invoicesApi
      .list({ per_page: 100 })
      .then((res) => {
        if (!cancelled) setInvoices(res.data ?? []);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load invoices');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredInvoices = useMemo(() => {
    let list = invoices;
    if (search) {
      const s = search.toLowerCase();
      list = list.filter(
        (inv) =>
          inv.invoice_number?.toLowerCase().includes(s) ||
          inv.customer?.business_name?.toLowerCase().includes(s)
      );
    }
    if (statusFilter !== 'all') {
      list = list.filter((inv) => getInvoiceStatus(inv) === statusFilter);
    }
    return list;
  }, [invoices, search, statusFilter]);

  const { overdue, dueThisWeek, upcoming, metrics } = useMemo(() => {
    const overdueList = filteredInvoices.filter((inv) => getInvoiceStatus(inv) === 'overdue');
    const dueThisWeekList = filteredInvoices.filter((inv) => {
      const status = getInvoiceStatus(inv);
      if (status !== 'sent' && status !== 'partial') return false;
      const due = inv.due_date ? new Date(inv.due_date) : null;
      if (!due) return false;
      const now = new Date();
      const weekEnd = new Date(now);
      weekEnd.setDate(weekEnd.getDate() + 7);
      return due >= now && due <= weekEnd;
    });
    const upcomingList = filteredInvoices.filter((inv) => {
      const status = getInvoiceStatus(inv);
      if (status !== 'sent' && status !== 'partial') return false;
      const due = inv.due_date ? new Date(inv.due_date) : null;
      if (!due) return false;
      const now = new Date();
      const weekEnd = new Date(now);
      weekEnd.setDate(weekEnd.getDate() + 7);
      return due > weekEnd;
    });

    const outstanding = filteredInvoices
      .filter((inv) => getInvoiceStatus(inv) !== 'paid' && getInvoiceStatus(inv) !== 'draft')
      .reduce((sum, inv) => sum + (typeof inv.balance_due === 'number' ? inv.balance_due : parseFloat(String(inv.balance_due)) || 0), 0);
    const overdueVal = overdueList.reduce(
      (sum, inv) => sum + (typeof inv.balance_due === 'number' ? inv.balance_due : parseFloat(String(inv.balance_due)) || 0),
      0
    );
    const dueWeekVal = dueThisWeekList.reduce(
      (sum, inv) => sum + (typeof inv.balance_due === 'number' ? inv.balance_due : parseFloat(String(inv.balance_due)) || 0),
      0
    );
    const collected = filteredInvoices
      .filter((inv) => getInvoiceStatus(inv) === 'paid')
      .reduce((sum, inv) => sum + (typeof inv.total === 'number' ? inv.total : parseFloat(String(inv.total)) || 0), 0);

    return {
      overdue: overdueList,
      dueThisWeek: dueThisWeekList,
      upcoming: upcomingList,
      metrics: {
        outstanding,
        overdueVal,
        dueWeekVal,
        collected,
      },
    };
  }, [filteredInvoices]);

  if (loading) {
    return (
      <div className="space-y-6 pb-12 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-slate-600">Loading invoices...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 pb-12 flex flex-col items-center justify-center min-h-[400px]">
        <p className="text-red-600 mb-4">{error}</p>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 pb-12"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">💰 Invoices</h1>
        <button
          onClick={() => onNavigate('invoice-new')}
          className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> New Invoice
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: 'Outstanding Total',
            value: formatCurrency(metrics.outstanding),
            subtext: `${filteredInvoices.filter((i) => getInvoiceStatus(i) !== 'paid' && getInvoiceStatus(i) !== 'draft').length} invoices`,
            icon: DollarSign,
            color: 'text-blue-600',
            bg: 'bg-blue-100',
          },
          {
            label: 'Overdue',
            value: formatCurrency(metrics.overdueVal),
            subtext: `${overdue.length} invoices`,
            icon: AlertCircle,
            color: 'text-red-600',
            bg: 'bg-red-100',
          },
          {
            label: 'Due This Week',
            value: formatCurrency(metrics.dueWeekVal),
            subtext: `${dueThisWeek.length} invoices`,
            icon: Clock,
            color: 'text-amber-600',
            bg: 'bg-amber-100',
          },
          {
            label: 'Collected',
            value: formatCurrency(metrics.collected),
            subtext: 'Paid invoices',
            icon: CheckCircle2,
            color: 'text-emerald-600',
            bg: 'bg-emerald-100',
          },
        ].map((metric, i) => {
          const Icon = metric.icon;
          return (
            <motion.div
              key={i}
              variants={itemVariants}
              className="bg-white rounded-xl shadow-sm border border-slate-100 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${metric.bg}`}>
                  <Icon className={`w-6 h-6 ${metric.color}`} />
                </div>
              </div>
              <p className="text-sm font-medium text-slate-500 mb-1">{metric.label}</p>
              <h3 className="text-2xl font-bold text-slate-900 mb-1">{metric.value}</h3>
              <p className="text-xs text-slate-500">{metric.subtext}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
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
                placeholder="Search invoices..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent outline-none text-sm flex-1"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 rounded-lg text-sm font-medium text-slate-700"
              >
                <option value="all">Status: All</option>
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="overdue">Overdue</option>
                <option value="partial">Partial</option>
                <option value="paid">Paid</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {viewMode === 'list' ? (
        <div className="space-y-6">
          {/* Overdue Section */}
          <motion.div
            variants={itemVariants}
            className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-slate-100 bg-red-50 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <h3 className="font-bold text-red-900">Overdue</h3>
            </div>
            <div className="divide-y divide-slate-100">
              {overdue.length === 0 ? (
                <div className="p-6 text-slate-500 text-sm">No overdue invoices</div>
              ) : (
                overdue.map((inv) => (
                  <div
                    key={inv.id}
                    className="p-4 hover:bg-slate-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-4">
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-medium text-slate-900">{inv.invoice_number}</span>
                          <span className="font-bold text-slate-900">{inv.customer?.business_name}</span>
                          <span className="text-red-600 text-xs font-bold bg-red-100 px-2 py-0.5 rounded-full">
                            {daysOverdue(inv.due_date)} days overdue
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 mt-1">
                          Due: {inv.due_date ? new Date(inv.due_date).toLocaleDateString('en-US') : '—'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 pl-8 md:pl-0">
                      <span className="font-bold text-slate-900 text-lg">{formatCurrency(inv.balance_due)}</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => onNavigate('invoice-detail', inv.id)}
                          className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 text-xs font-medium rounded hover:bg-slate-50 transition-colors"
                        >
                          View
                        </button>
                        <button
                          onClick={() => onNavigate('invoice-detail', inv.id)}
                          className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 text-xs font-medium rounded hover:bg-slate-50 transition-colors"
                        >
                          Record Payment
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>

          {/* Due This Week */}
          <motion.div
            variants={itemVariants}
            className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-slate-100 bg-amber-50 flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-600" />
              <h3 className="font-bold text-amber-900">Due This Week</h3>
            </div>
            <div className="divide-y divide-slate-100">
              {dueThisWeek.length === 0 ? (
                <div className="p-6 text-slate-500 text-sm">No invoices due this week</div>
              ) : (
                dueThisWeek.map((inv) => (
                  <div
                    key={inv.id}
                    className="p-4 hover:bg-slate-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-4">
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-medium text-slate-900">{inv.invoice_number}</span>
                          <span className="font-bold text-slate-900">{inv.customer?.business_name}</span>
                        </div>
                        <p className="text-sm text-slate-600 mt-1">
                          Due: {inv.due_date ? new Date(inv.due_date).toLocaleDateString('en-US') : '—'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 pl-8 md:pl-0">
                      <span className="font-bold text-slate-900 text-lg">{formatCurrency(inv.balance_due)}</span>
                      <button
                        onClick={() => onNavigate('invoice-detail', inv.id)}
                        className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 text-xs font-medium rounded hover:bg-slate-50 transition-colors"
                      >
                        View
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>

          {/* Upcoming */}
          <motion.div
            variants={itemVariants}
            className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-slate-100 bg-emerald-50 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-emerald-900">Upcoming</h3>
            </div>
            <div className="divide-y divide-slate-100">
              {upcoming.length === 0 ? (
                <div className="p-6 text-slate-500 text-sm">No upcoming invoices</div>
              ) : (
                upcoming.map((inv) => (
                  <div
                    key={inv.id}
                    className="p-4 hover:bg-slate-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-4">
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-medium text-slate-900">{inv.invoice_number}</span>
                          <span className="font-bold text-slate-900">{inv.customer?.business_name}</span>
                        </div>
                        <p className="text-sm text-slate-600 mt-1">
                          Due: {inv.due_date ? new Date(inv.due_date).toLocaleDateString('en-US') : '—'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 pl-8 md:pl-0">
                      <span className="font-bold text-slate-900 text-lg">{formatCurrency(inv.balance_due)}</span>
                      <button
                        onClick={() => onNavigate('invoice-detail', inv.id)}
                        className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 text-xs font-medium rounded hover:bg-slate-50 transition-colors"
                      >
                        View
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {[
            { id: 'draft', title: 'DRAFT', color: 'border-slate-400' },
            { id: 'sent', title: 'SENT', color: 'border-blue-500' },
            { id: 'overdue', title: 'OVERDUE', color: 'border-red-500' },
            { id: 'partial', title: 'PARTIALLY PAID', color: 'border-amber-500' },
            { id: 'paid', title: 'PAID', color: 'border-emerald-500' },
          ].map((col) => {
            const list = filteredInvoices.filter((inv) => getInvoiceStatus(inv) === col.id);
            const colValue = list.reduce(
              (sum, inv) =>
                sum +
                (col.id === 'paid'
                  ? (typeof inv.total === 'number' ? inv.total : parseFloat(String(inv.total)) || 0)
                  : (typeof inv.balance_due === 'number' ? inv.balance_due : parseFloat(String(inv.balance_due)) || 0)),
              0
            );
            return (
              <div key={col.id} className="w-80 flex-shrink-0 flex flex-col">
                <div className={`bg-slate-100 rounded-t-xl p-4 border-t-4 ${col.color} shrink-0 mb-3`}>
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="font-bold text-slate-700 text-sm">{col.title}</h3>
                    <span className="text-xs font-medium text-slate-500">{list.length} invoices</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-900">{formatCurrency(colValue)}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  {list.map((inv) => (
                    <InvoiceCard
                      key={inv.id}
                      id={inv.invoice_number}
                      client={inv.customer?.business_name || 'Unknown'}
                      amount={formatCurrency(inv.balance_due)}
                      status={getInvoiceStatus(inv)}
                      date={
                        inv.due_date
                          ? new Date(inv.due_date).toLocaleDateString('en-US')
                          : '—'
                      }
                      daysOverdue={daysOverdue(inv.due_date) || undefined}
                      onClick={() => onNavigate('invoice-detail', inv.id)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
