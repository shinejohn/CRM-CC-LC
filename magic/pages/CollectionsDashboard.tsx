import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Mail,
  Phone,
  AlertCircle,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { invoicesApi, type Invoice } from '../../src/services/crm/invoices-api';

function formatCurrency(value: string | number): string {
  const n = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(n)) return '$0';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(n);
}

function daysOverdue(dueDate?: string): number {
  if (!dueDate) return 0;
  const due = new Date(dueDate);
  const now = new Date();
  if (due >= now) return 0;
  return Math.floor((now.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
}

export function CollectionsDashboard() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const { overdueInvoices, aging, metrics } = useMemo(() => {
    const overdueList = invoices.filter((inv) => {
      const balance = typeof inv.balance_due === 'number' ? inv.balance_due : parseFloat(String(inv.balance_due)) || 0;
      return balance > 0 && inv.due_date && new Date(inv.due_date) < new Date();
    });

    const d30: Invoice[] = [];
    const d60: Invoice[] = [];
    const d90: Invoice[] = [];
    for (const inv of overdueList) {
      const days = daysOverdue(inv.due_date);
      if (days <= 30) d30.push(inv);
      else if (days <= 60) d60.push(inv);
      else d90.push(inv);
    }

    const totalOutstanding = invoices
      .filter((inv) => {
        const balance = typeof inv.balance_due === 'number' ? inv.balance_due : parseFloat(String(inv.balance_due)) || 0;
        return balance > 0;
      })
      .reduce((sum, inv) => sum + (typeof inv.balance_due === 'number' ? inv.balance_due : parseFloat(String(inv.balance_due)) || 0), 0);

    const v30 = d30.reduce((s, i) => s + (typeof i.balance_due === 'number' ? i.balance_due : parseFloat(String(i.balance_due)) || 0), 0);
    const v60 = d60.reduce((s, i) => s + (typeof i.balance_due === 'number' ? i.balance_due : parseFloat(String(i.balance_due)) || 0), 0);
    const v90 = d90.reduce((s, i) => s + (typeof i.balance_due === 'number' ? i.balance_due : parseFloat(String(i.balance_due)) || 0), 0);

    const byAccount: Record<string, { current: number; d30: number; d60: number; d90: number }> = {};
    for (const inv of overdueList) {
      const name = inv.customer?.business_name || 'Unknown';
      if (!byAccount[name]) byAccount[name] = { current: 0, d30: 0, d60: 0, d90: 0 };
      const amt = typeof inv.balance_due === 'number' ? inv.balance_due : parseFloat(String(inv.balance_due)) || 0;
      const days = daysOverdue(inv.due_date);
      if (days <= 30) byAccount[name].d30 += amt;
      else if (days <= 60) byAccount[name].d60 += amt;
      else byAccount[name].d90 += amt;
    }

    return {
      overdueInvoices: overdueList.sort((a, b) => daysOverdue(b.due_date) - daysOverdue(a.due_date)),
      aging: { d30, d60, d90, v30, v60, v90 },
      metrics: { totalOutstanding, byAccount },
    };
  }, [invoices]);

  if (loading) {
    return (
      <div className="space-y-6 pb-12 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-slate-600">Loading collections...</span>
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
        <h1 className="text-2xl font-bold text-slate-900">💳 Collections</h1>
        <button className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2">
          <Mail className="w-4 h-4" /> Send Bulk Reminder
        </button>
      </div>

      {/* Aging Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          {
            label: 'Total Outstanding',
            value: formatCurrency(metrics.totalOutstanding),
            subtext: `${invoices.filter((i) => (typeof i.balance_due === 'number' ? i.balance_due : parseFloat(String(i.balance_due)) || 0) > 0).length} invoices`,
            color: 'text-slate-900',
            bg: 'bg-slate-100',
          },
          {
            label: '1-30 Days Overdue',
            value: formatCurrency(aging.v30),
            subtext: `${aging.d30.length} invoices`,
            color: 'text-amber-600',
            bg: 'bg-amber-100',
          },
          {
            label: '31-60 Days Overdue',
            value: formatCurrency(aging.v60),
            subtext: `${aging.d60.length} invoices`,
            color: 'text-orange-600',
            bg: 'bg-orange-100',
          },
          {
            label: '60+ Days Overdue',
            value: formatCurrency(aging.v90),
            subtext: `${aging.d90.length} invoices`,
            color: 'text-red-600',
            bg: 'bg-red-100',
          },
        ].map((metric, i) => (
          <motion.div
            key={i}
            variants={itemVariants}
            className="bg-white rounded-xl shadow-sm border border-slate-100 p-6"
          >
            <p className="text-sm font-medium text-slate-500 mb-1">{metric.label}</p>
            <h3 className={`text-2xl font-bold mb-1 ${metric.color}`}>{metric.value}</h3>
            <p className="text-xs text-slate-500">{metric.subtext}</p>
            <div className={`h-1 w-full mt-4 rounded-full ${metric.bg}`}>
              <div
                className={`h-full rounded-full bg-slate-400`}
                style={{ width: '66%' }}
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Critical Accounts */}
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-slate-100 bg-red-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <h3 className="font-bold text-red-900">Overdue Invoices</h3>
          </div>
          <button className="text-sm font-bold text-red-700 hover:underline">Call All</button>
        </div>
        <div className="divide-y divide-slate-100">
          {overdueInvoices.length === 0 ? (
            <div className="p-6 text-slate-500 text-sm">No overdue invoices</div>
          ) : (
            overdueInvoices.slice(0, 10).map((inv) => (
              <div
                key={inv.id}
                className="p-6 hover:bg-slate-50 transition-colors flex flex-col md:flex-row justify-between gap-6"
              >
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-slate-900 text-lg">{inv.customer?.business_name}</h4>
                    <span className="font-bold text-red-600 text-lg">
                      {formatCurrency(inv.balance_due)}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mb-1">
                    {inv.invoice_number} |{' '}
                    <span className="font-medium text-red-600">{daysOverdue(inv.due_date)} days overdue</span>
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2">
                    <Phone className="w-4 h-4" /> Call
                  </button>
                  <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2">
                    <Mail className="w-4 h-4" /> Final Notice
                  </button>
                  <button className="px-4 py-2 bg-red-50 text-red-700 text-sm font-medium rounded-lg hover:bg-red-100 transition-colors flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" /> Mark Disputed
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>

      {/* Aging Report */}
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-900">Aging Report</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
              <tr>
                <th className="px-6 py-3">Account</th>
                <th className="px-6 py-3 text-right">Current</th>
                <th className="px-6 py-3 text-right">1-30</th>
                <th className="px-6 py-3 text-right">31-60</th>
                <th className="px-6 py-3 text-right">60+</th>
                <th className="px-6 py-3 text-right font-bold">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {Object.entries(metrics.byAccount || {}).map(([name, row]) => (
                <tr key={name} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">{name}</td>
                  <td className="px-6 py-4 text-right text-slate-600">$0</td>
                  <td className="px-6 py-4 text-right text-amber-600 font-medium">
                    {formatCurrency(row.d30)}
                  </td>
                  <td className="px-6 py-4 text-right text-orange-600 font-medium">
                    {formatCurrency(row.d60)}
                  </td>
                  <td className="px-6 py-4 text-right text-red-600 font-bold">
                    {formatCurrency(row.d90)}
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-slate-900">
                    {formatCurrency(row.d30 + row.d60 + row.d90)}
                  </td>
                </tr>
              ))}
              {Object.keys(metrics.byAccount || {}).length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    No overdue invoices
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}
