import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Download, FileText, ArrowUp, CheckCircle2, Circle } from 'lucide-react';
export function RevenueDetailReport({
  onBack
}: {
  onBack: () => void;
}) {
  const transactions = [{
    date: 'Dec 28',
    customer: 'John Smith',
    service: 'Drain Cleaning',
    amount: '$185',
    status: 'paid'
  }, {
    date: 'Dec 27',
    customer: 'ABC Corp',
    service: 'Water Heater',
    amount: '$850',
    status: 'paid'
  }, {
    date: 'Dec 26',
    customer: 'Mary Johnson',
    service: 'Emergency Repair',
    amount: '$450',
    status: 'due'
  }, {
    date: 'Dec 24',
    customer: 'Tech Solutions',
    service: 'Pipe Repair',
    amount: '$320',
    status: 'paid'
  }, {
    date: 'Dec 23',
    customer: 'Adams Family',
    service: 'Inspection',
    amount: '$75',
    status: 'paid'
  }];
  const services = [{
    name: 'Plumbing Repairs',
    amount: 4800,
    percent: 38
  }, {
    name: 'Water Heaters',
    amount: 3200,
    percent: 25
  }, {
    name: 'Drain Cleaning',
    amount: 2100,
    percent: 17
  }, {
    name: 'Emergency Calls',
    amount: 1450,
    percent: 12
  }, {
    name: 'Other Services',
    amount: 900,
    percent: 8
  }];
  const customers = [{
    name: 'ABC Corporation',
    amount: 2400,
    percent: 19
  }, {
    name: 'Smith Residence',
    amount: 1800,
    percent: 14
  }, {
    name: 'Johnson Home',
    amount: 1200,
    percent: 10
  }, {
    name: 'Tech Solutions',
    amount: 950,
    percent: 8
  }, {
    name: 'Others (40)',
    amount: 6100,
    percent: 49
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
          <ArrowLeft className="w-4 h-4" /> Back to Overview
        </button>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <span className="text-2xl">💰</span> Revenue Report
        </h1>
        <div className="flex gap-2">
          <button className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2">
            <FileText className="w-4 h-4" /> Export PDF
          </button>
        </div>
      </div>

      {/* Period Selector */}
      <div className="flex justify-end">
        <select className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20">
          <option>Last 30 Days</option>
          <option>This Month</option>
          <option>Last Month</option>
          <option>This Quarter</option>
          <option>This Year</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <p className="text-sm font-medium text-slate-500 mb-1">
            Total Revenue
          </p>
          <h3 className="text-2xl font-bold text-slate-900">$12,450</h3>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <p className="text-sm font-medium text-slate-500 mb-1">
            vs Last Month
          </p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-bold text-emerald-600 flex items-center gap-1">
              <ArrowUp className="w-4 h-4" /> 12%
            </h3>
            <span className="text-sm text-emerald-600 font-medium">
              (+$1,320)
            </span>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <p className="text-sm font-medium text-slate-500 mb-1">Avg Order</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-bold text-slate-900">$285</h3>
            <span className="text-sm text-emerald-600 font-medium flex items-center">
              <ArrowUp className="w-3 h-3" /> $15
            </span>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <p className="text-sm font-medium text-slate-500 mb-1">Orders</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-bold text-slate-900">44</h3>
            <span className="text-sm text-emerald-600 font-medium flex items-center">
              <ArrowUp className="w-3 h-3" /> 6
            </span>
          </div>
        </div>
      </div>

      {/* Revenue Trend Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <h3 className="font-bold text-slate-900 mb-6">Revenue Trend</h3>
        <div className="h-64 flex items-end justify-between gap-1 relative">
          {/* Grid lines */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
            {[500, 400, 300, 200, 100].map(val => <div key={val} className="w-full h-px bg-slate-100 relative">
                <span className="absolute -left-8 -top-2 text-xs text-slate-400">
                  ${val}
                </span>
              </div>)}
            <div className="w-full h-px bg-slate-200" />
          </div>

          {/* Bars */}
          {Array.from({
          length: 30
        }).map((_, i) => {
          const height = Math.random() * 80 + 20;
          return <div key={i} className="w-full bg-blue-50 rounded-t hover:bg-blue-100 transition-colors relative group z-10" style={{
            height: `${height}%`
          }}>
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                  ${Math.round(height * 5)}
                </div>
              </div>;
        })}
        </div>
        <div className="flex justify-between mt-2 text-xs text-slate-400 px-2">
          <span>Dec 1</span>
          <span>Dec 8</span>
          <span>Dec 15</span>
          <span>Dec 22</span>
          <span>Dec 29</span>
        </div>
      </div>

      {/* Breakdown Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Revenue by Service */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-900">Revenue by Service</h3>
            <button className="text-sm text-blue-600 font-medium hover:underline">
              View All
            </button>
          </div>
          <div className="space-y-4">
            {services.map((service, index) => <div key={index}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-slate-700">
                    {service.name}
                  </span>
                  <span className="font-bold text-slate-900">
                    ${service.amount.toLocaleString()}
                  </span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{
                width: `${service.percent}%`
              }} />
                </div>
              </div>)}
          </div>
        </div>

        {/* Revenue by Customer */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-900">Revenue by Customer</h3>
            <button className="text-sm text-blue-600 font-medium hover:underline">
              View All
            </button>
          </div>
          <div className="space-y-4">
            {customers.map((customer, index) => <div key={index}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-slate-700">
                    {customer.name}
                  </span>
                  <span className="font-bold text-slate-900">
                    ${customer.amount.toLocaleString()}
                  </span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{
                width: `${customer.percent}%`
              }} />
                </div>
              </div>)}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-slate-900">Recent Transactions</h3>
          <button className="text-sm text-blue-600 font-medium hover:underline">
            View All Transactions →
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wide">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wide">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wide">
                  Service
                </th>
                <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wide">
                  Amount
                </th>
                <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wide">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.map((tx, index) => <tr key={index} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {tx.date}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">
                    {tx.customer}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {tx.service}
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-900 text-right">
                    {tx.amount}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {tx.status === 'paid' ? <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">
                        <CheckCircle2 className="w-3 h-3" /> Paid
                      </span> : <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">
                        <Circle className="w-3 h-3" /> Due
                      </span>}
                  </td>
                </tr>)}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>;
}