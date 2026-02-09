import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Download, Search, Filter, CheckCircle2, ArrowUpCircle } from 'lucide-react';
export function OrderHistoryPage({
  onBack
}: {
  onBack: () => void;
}) {
  const orders = [{
    id: 'ORD-1247',
    date: 'Dec 15, 2024',
    item: 'Sarah (Marketing)',
    amount: '$99/mo',
    status: 'active'
  }, {
    id: 'ORD-1198',
    date: 'Nov 20, 2024',
    item: 'Plan Upgrade: Tier 2',
    amount: '$199/mo',
    status: 'active'
  }, {
    id: 'ORD-1156',
    date: 'Nov 1, 2024',
    item: 'Derek (Dispatch)',
    amount: '$99/mo',
    status: 'active'
  }, {
    id: 'ORD-1089',
    date: 'Oct 15, 2024',
    item: 'Olivia (Customer Service)',
    amount: '$79/mo',
    status: 'active'
  }, {
    id: 'ORD-0987',
    date: 'Sep 1, 2024',
    item: 'Initial Plan: Tier 1',
    amount: '$99/mo',
    status: 'upgraded'
  }];
  return <motion.div initial={{
    opacity: 0,
    y: 20
  }} animate={{
    opacity: 1,
    y: 0
  }} className="max-w-5xl mx-auto pb-12 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to My Services
        </button>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <span className="text-2xl">📜</span> Order History
        </h1>
        <button className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 flex flex-col md:flex-row gap-4">
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
          <select className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20">
            <option>All Orders</option>
            <option>Subscriptions</option>
            <option>One-time</option>
          </select>
          <select className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20">
            <option>All Time</option>
            <option>Last 30 Days</option>
            <option>Last 3 Months</option>
            <option>2024</option>
          </select>
          <select className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20">
            <option>Status: All</option>
            <option>Active</option>
            <option>Upgraded</option>
            <option>Cancelled</option>
          </select>
        </div>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Search orders..." className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
        </div>
      </div>

      {/* Order Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wide">
                  Order #
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wide">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wide">
                  Item
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wide">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wide">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map((order, index) => <motion.tr key={index} initial={{
              opacity: 0,
              x: -10
            }} animate={{
              opacity: 1,
              x: 0
            }} transition={{
              delay: index * 0.05
            }} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-mono text-slate-600">
                    {order.id}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {order.date}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">
                    {order.item}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {order.amount}
                  </td>
                  <td className="px-6 py-4">
                    {order.status === 'active' ? <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">
                        <CheckCircle2 className="w-3 h-3" /> Active
                      </span> : <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-full">
                        <ArrowUpCircle className="w-3 h-3" /> Upgraded
                      </span>}
                  </td>
                </motion.tr>)}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-slate-100 text-center text-sm text-slate-500">
          Showing 1-5 of 5 orders
        </div>
      </div>
    </motion.div>;
}