import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { LearningLayout } from '@/components/LearningCenter/Layout/LearningLayout';
import { orderApi, type Order } from '@/services/learning/order-api';
import { ArrowLeft, CheckCircle2, Loader2, Clock } from 'lucide-react';

export const OrderHistoryPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await orderApi.list({ per_page: 50 });
      setOrders(data.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const breadcrumbs = [
    { label: 'Learning Center', href: '/learning' },
    { label: 'Services', href: '/learning/services' },
    { label: 'Order History' },
  ];

  if (loading) {
    return (
      <LearningLayout title="Order History" breadcrumbs={breadcrumbs}>
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-indigo-600" size={32} />
        </div>
      </LearningLayout>
    );
  }

  return (
    <LearningLayout title="Order History" breadcrumbs={breadcrumbs}>
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <Link
            to="/learning/services/billing"
            className="flex items-center gap-2 text-slate-500 hover:text-slate-700"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Billing
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Order History
          </h1>
          <div className="w-24" />
        </div>

        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-700">{error}</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                      Order #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                      Items
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                        No orders yet
                      </td>
                    </tr>
                  ) : (
                    orders.map((order) => (
                      <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                        <td className="px-6 py-4 text-sm font-mono text-slate-600 dark:text-slate-300">
                          {order.order_number}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                          {new Date(order.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                          {order.items?.map((i) => i.service_name).join(', ') ?? '—'}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">
                          ${order.total.toFixed(2)}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${
                              order.payment_status === 'paid'
                                ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300'
                                : 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300'
                            }`}
                          >
                            {order.payment_status === 'paid' ? (
                              <CheckCircle2 className="w-3 h-3" />
                            ) : (
                              <Clock className="w-3 h-3" />
                            )}
                            {order.payment_status.charAt(0).toUpperCase() +
                              order.payment_status.slice(1)}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t border-slate-200 dark:border-slate-700 text-center text-sm text-slate-500">
              Showing {orders.length} order(s)
            </div>
          </div>
        )}
      </div>
    </LearningLayout>
  );
};
