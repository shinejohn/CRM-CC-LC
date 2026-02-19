import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { LearningLayout } from '@/components/LearningCenter/Layout/LearningLayout';
import { billingApi, type BillingSummary, type Invoice } from '@/services/learning/billing-api';
import { CreditCard, Download, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';

export const BillingDashboardPage: React.FC = () => {
  const [summary, setSummary] = useState<BillingSummary | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [summaryData, invoicesData] = await Promise.all([
        billingApi.summary(),
        billingApi.invoices({ per_page: 20 }),
      ]);
      setSummary(summaryData);
      setInvoices(invoicesData.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load billing data');
    } finally {
      setLoading(false);
    }
  };

  const handlePayInvoice = async (invoiceId: string) => {
    try {
      const { url } = await billingApi.payInvoice(invoiceId);
      if (url) window.location.href = url;
    } catch (err) {
      console.error('Failed to initiate payment:', err);
    }
  };

  const breadcrumbs = [
    { label: 'Learning Center', href: '/learning' },
    { label: 'Services', href: '/learning/services' },
    { label: 'Billing' },
  ];

  if (loading) {
    return (
      <LearningLayout title="Billing" breadcrumbs={breadcrumbs}>
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-indigo-600" size={32} />
        </div>
      </LearningLayout>
    );
  }

  if (error) {
    return (
      <LearningLayout title="Billing" breadcrumbs={breadcrumbs}>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertTriangle className="mx-auto text-red-500 mb-2" size={32} />
          <p className="text-red-700">{error}</p>
        </div>
      </LearningLayout>
    );
  }

  return (
    <LearningLayout title="Billing & Subscription" breadcrumbs={breadcrumbs}>
      <div className="max-w-5xl mx-auto space-y-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Billing & Subscription
        </h1>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Monthly Cost</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                ${summary.monthlyCost.toFixed(2)}
              </p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Usage</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {summary.usagePercent}%
              </p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Outstanding</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                ${summary.outstanding.toFixed(2)}
              </p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Next Billing</p>
              <p className="text-lg font-bold text-slate-900 dark:text-white">
                {summary.nextBillingDate
                  ? new Date(summary.nextBillingDate).toLocaleDateString()
                  : '—'}
              </p>
            </div>
          </div>
        )}

        {/* Payment History */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Payment History</h2>
            <Link
              to="/learning/services/orders"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
            >
              View All Orders
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                      No payment history yet
                    </td>
                  </tr>
                ) : (
                  invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                        {new Date(inv.dueDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                        {inv.serviceName}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">
                        ${inv.amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${
                            inv.status === 'paid'
                              ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300'
                              : 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300'
                          }`}
                        >
                          {inv.status === 'paid' ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : null}
                          {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {(inv.status === 'pending' || inv.status === 'overdue') && (
                          <button
                            onClick={() => handlePayInvoice(inv.id)}
                            className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
                          >
                            Pay Now
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </LearningLayout>
  );
};
