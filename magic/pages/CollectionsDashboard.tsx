import React, { Children } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, AlertCircle, TrendingDown, CheckCircle2, DollarSign, AlertTriangle } from 'lucide-react';
export function CollectionsDashboard() {
  const containerVariants = {
    hidden: {
      opacity: 0
    },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 20
    },
    visible: {
      opacity: 1,
      y: 0
    }
  };
  return <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">💳 Collections</h1>
        <button className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2">
          <Mail className="w-4 h-4" /> Send Bulk Reminder
        </button>
      </div>

      {/* Aging Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[{
        label: 'Total Outstanding',
        value: '$18,400',
        subtext: '12 invoices',
        color: 'text-slate-900',
        bg: 'bg-slate-100'
      }, {
        label: '1-30 Days Overdue',
        value: '$5,200',
        subtext: '4 invoices',
        color: 'text-amber-600',
        bg: 'bg-amber-100'
      }, {
        label: '31-60 Days Overdue',
        value: '$4,700',
        subtext: '2 invoices',
        color: 'text-orange-600',
        bg: 'bg-orange-100'
      }, {
        label: '60+ Days Overdue',
        value: '$8,500',
        subtext: '3 invoices',
        color: 'text-red-600',
        bg: 'bg-red-100'
      }].map((metric, i) => <motion.div key={i} variants={itemVariants} className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <p className="text-sm font-medium text-slate-500 mb-1">
              {metric.label}
            </p>
            <h3 className={`text-2xl font-bold mb-1 ${metric.color}`}>
              {metric.value}
            </h3>
            <p className="text-xs text-slate-500">{metric.subtext}</p>
            <div className={`h-1 w-full mt-4 rounded-full ${metric.bg}`}>
              <div className={`h-full rounded-full w-2/3 ${metric.color.replace('text', 'bg')}`} />
            </div>
          </motion.div>)}
      </div>

      {/* Critical Accounts */}
      <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-red-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <h3 className="font-bold text-red-900">Critical (60+ Days)</h3>
          </div>
          <button className="text-sm font-bold text-red-700 hover:underline">
            Call All
          </button>
        </div>
        <div className="divide-y divide-slate-100">
          {[{
          name: 'Acme Corporation',
          amount: '$4,500',
          invoice: 'INV-0142',
          days: 32,
          reminders: 3,
          note: 'Last Contact: Dec 15 - No response'
        }, {
          name: 'TechCorp',
          amount: '$2,800',
          invoice: 'INV-0138',
          days: 45,
          reminders: 4,
          note: 'Last Contact: Dec 10 - "Payment next week" (didn\'t pay)'
        }].map((account, i) => <div key={i} className="p-6 hover:bg-slate-50 transition-colors flex flex-col md:flex-row justify-between gap-6">
              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-slate-900 text-lg">
                    {account.name}
                  </h4>
                  <span className="font-bold text-red-600 text-lg">
                    {account.amount}
                  </span>
                </div>
                <p className="text-sm text-slate-600 mb-1">
                  {account.invoice} |{' '}
                  <span className="font-medium text-red-600">
                    {account.days} days overdue
                  </span>{' '}
                  | {account.reminders} reminders sent
                </p>
                <p className="text-sm text-slate-500 italic">{account.note}</p>
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
            </div>)}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Aging Report */}
        <motion.div variants={itemVariants} className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
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
                {[{
                name: 'Acme Corporation',
                current: 0,
                d30: 0,
                d60: 4500,
                d90: 0,
                total: 4500
              }, {
                name: 'Beta Inc',
                current: 0,
                d30: 3700,
                d60: 0,
                d90: 0,
                total: 3700
              }, {
                name: 'TechCorp',
                current: 0,
                d30: 0,
                d60: 0,
                d90: 2800,
                total: 2800
              }, {
                name: 'Delta Co',
                current: 4800,
                d30: 0,
                d60: 0,
                d90: 0,
                total: 4800
              }, {
                name: 'StartUp Inc',
                current: 2600,
                d30: 0,
                d60: 0,
                d90: 0,
                total: 2600
              }].map((row, i) => <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {row.name}
                    </td>
                    <td className="px-6 py-4 text-right text-slate-600">
                      ${row.current.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right text-amber-600 font-medium">
                      ${row.d30.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right text-orange-600 font-medium">
                      ${row.d60.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right text-red-600 font-bold">
                      ${row.d90.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-slate-900">
                      ${row.total.toLocaleString()}
                    </td>
                  </tr>)}
                <tr className="bg-slate-50 font-bold">
                  <td className="px-6 py-4">TOTAL</td>
                  <td className="px-6 py-4 text-right">$7,400</td>
                  <td className="px-6 py-4 text-right">$3,700</td>
                  <td className="px-6 py-4 text-right">$4,500</td>
                  <td className="px-6 py-4 text-right">$2,800</td>
                  <td className="px-6 py-4 text-right">$18,400</td>
                </tr>
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Collection Metrics */}
        <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <h3 className="font-bold text-slate-900 mb-6">Collection Metrics</h3>
          <div className="space-y-6">
            <div>
              <p className="text-sm text-slate-500 mb-1">Average Days to Pay</p>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-bold text-slate-900">28</span>
                <span className="text-sm font-medium text-emerald-600 mb-1 flex items-center">
                  <TrendingDown className="w-4 h-4 mr-1" /> improving
                </span>
              </div>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1">Collection Rate</p>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-bold text-slate-900">94%</span>
                <span className="text-sm font-medium text-slate-400 mb-1">
                  target: 95%
                </span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-blue-600 w-[94%]" />
              </div>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1">
                Bad Debt Write-offs (YTD)
              </p>
              <span className="text-3xl font-bold text-slate-900">$1,200</span>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>;
}