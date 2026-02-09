import React, { useState, Children } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, ChevronDown, Layout, List, Calendar, DollarSign, AlertCircle, CheckCircle2, Clock, Mail, Download } from 'lucide-react';
import { InvoiceCard } from '../components/InvoiceCard';
export function InvoicesListPage({
  onNavigate
}: {
  onNavigate: (page: string) => void;
}) {
  const [viewMode, setViewMode] = useState<'list' | 'board'>('list');
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
        <h1 className="text-2xl font-bold text-slate-900">💰 Invoices</h1>
        <button onClick={() => onNavigate('invoice-new')} className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Invoice
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[{
        label: 'Outstanding Total',
        value: '$18,400',
        subtext: '12 invoices',
        icon: DollarSign,
        color: 'text-blue-600',
        bg: 'bg-blue-100'
      }, {
        label: 'Overdue',
        value: '$8,200',
        subtext: '3 invoices',
        icon: AlertCircle,
        color: 'text-red-600',
        bg: 'bg-red-100'
      }, {
        label: 'Due This Week',
        value: '$5,400',
        subtext: '4 invoices',
        icon: Clock,
        color: 'text-amber-600',
        bg: 'bg-amber-100'
      }, {
        label: 'Collected This Month',
        value: '$42,300',
        subtext: '▲ +12%',
        icon: CheckCircle2,
        color: 'text-emerald-600',
        bg: 'bg-emerald-100'
      }].map((metric, i) => <motion.div key={i} variants={itemVariants} className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${metric.bg}`}>
                <metric.icon className={`w-6 h-6 ${metric.color}`} />
              </div>
            </div>
            <p className="text-sm font-medium text-slate-500 mb-1">
              {metric.label}
            </p>
            <h3 className="text-2xl font-bold text-slate-900 mb-1">
              {metric.value}
            </h3>
            <p className="text-xs text-slate-500">{metric.subtext}</p>
          </motion.div>)}
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
              <button onClick={() => setViewMode('list')} className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}>
                <List className="w-4 h-4" />
              </button>
              <button onClick={() => setViewMode('board')} className={`p-1.5 rounded ${viewMode === 'board' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}>
                <Layout className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg w-64">
              <Search className="w-4 h-4 text-slate-400" />
              <input type="text" placeholder="Search invoices..." className="bg-transparent outline-none text-sm flex-1" />
            </div>

            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 rounded-lg text-sm font-medium text-slate-700 flex items-center gap-1">
                Status: All <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {viewMode === 'list' ? <div className="space-y-6">
          {/* Overdue Section */}
          <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-red-50 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <h3 className="font-bold text-red-900">Overdue</h3>
            </div>
            <div className="divide-y divide-slate-100">
              {[{
            id: 'INV-0142',
            client: 'Acme Corporation',
            service: 'Q1 Services',
            amount: '$4,500',
            overdue: '32 days',
            due: 'Dec 1'
          }, {
            id: 'INV-0148',
            client: 'Beta Inc',
            service: 'Consulting Services',
            amount: '$3,700',
            overdue: '18 days',
            due: 'Dec 14'
          }].map((invoice, i) => <div key={i} className="p-4 hover:bg-slate-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <input type="checkbox" className="mt-1 w-4 h-4 rounded border-slate-300" />
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-medium text-slate-900">
                          {invoice.id}
                        </span>
                        <span className="font-bold text-slate-900">
                          {invoice.client}
                        </span>
                        <span className="text-red-600 text-xs font-bold bg-red-100 px-2 py-0.5 rounded-full">
                          {invoice.overdue} overdue
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 mt-1">
                        {invoice.service} • Due: {invoice.due}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 pl-8 md:pl-0">
                    <span className="font-bold text-slate-900 text-lg">
                      {invoice.amount}
                    </span>
                    <div className="flex gap-2">
                      <button className="px-3 py-1.5 bg-red-100 text-red-700 text-xs font-bold rounded hover:bg-red-200 transition-colors">
                        Send Reminder
                      </button>
                      <button onClick={() => onNavigate('invoice-detail')} className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 text-xs font-medium rounded hover:bg-slate-50 transition-colors">
                        View
                      </button>
                      <button className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 text-xs font-medium rounded hover:bg-slate-50 transition-colors">
                        Record Payment
                      </button>
                    </div>
                  </div>
                </div>)}
            </div>
          </motion.div>

          {/* Due This Week Section */}
          <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-amber-50 flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-600" />
              <h3 className="font-bold text-amber-900">Due This Week</h3>
            </div>
            <div className="divide-y divide-slate-100">
              {[{
            id: 'INV-0156',
            client: 'TechStart Inc',
            amount: '$2,800',
            due: 'Jan 3 (Fri)'
          }, {
            id: 'INV-0158',
            client: 'Gamma LLC',
            amount: '$2,600',
            due: 'Jan 6 (Mon)'
          }].map((invoice, i) => <div key={i} className="p-4 hover:bg-slate-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <input type="checkbox" className="mt-1 w-4 h-4 rounded border-slate-300" />
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-medium text-slate-900">
                          {invoice.id}
                        </span>
                        <span className="font-bold text-slate-900">
                          {invoice.client}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 mt-1">
                        Due: {invoice.due}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 pl-8 md:pl-0">
                    <span className="font-bold text-slate-900 text-lg">
                      {invoice.amount}
                    </span>
                    <button onClick={() => onNavigate('invoice-detail')} className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 text-xs font-medium rounded hover:bg-slate-50 transition-colors">
                      View
                    </button>
                  </div>
                </div>)}
            </div>
          </motion.div>

          {/* Upcoming Section */}
          <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-emerald-50 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-emerald-900">Upcoming</h3>
            </div>
            <div className="divide-y divide-slate-100">
              {[{
            id: 'INV-0160',
            client: 'Delta Co',
            amount: '$4,800',
            due: 'Jan 15'
          }, {
            id: 'INV-0162',
            client: 'MainStreet',
            amount: '$2,200',
            due: 'Jan 20'
          }].map((invoice, i) => <div key={i} className="p-4 hover:bg-slate-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <input type="checkbox" className="mt-1 w-4 h-4 rounded border-slate-300" />
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-medium text-slate-900">
                          {invoice.id}
                        </span>
                        <span className="font-bold text-slate-900">
                          {invoice.client}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 mt-1">
                        Due: {invoice.due}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 pl-8 md:pl-0">
                    <span className="font-bold text-slate-900 text-lg">
                      {invoice.amount}
                    </span>
                    <button onClick={() => onNavigate('invoice-detail')} className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 text-xs font-medium rounded hover:bg-slate-50 transition-colors">
                      View
                    </button>
                  </div>
                </div>)}
            </div>
          </motion.div>

          {/* Bulk Actions */}
          <div className="flex items-center justify-between text-sm text-slate-500">
            <span>Selected: 0</span>
            <div className="flex gap-3">
              <button className="flex items-center gap-1 text-slate-600 hover:text-blue-600 font-medium">
                <Mail className="w-4 h-4" /> Send Bulk Reminder
              </button>
              <button className="flex items-center gap-1 text-slate-600 hover:text-blue-600 font-medium">
                <Download className="w-4 h-4" /> Export
              </button>
            </div>
          </div>
        </div> /* Board View */ : <div className="flex gap-4 overflow-x-auto pb-4">
          {[{
        title: 'DRAFT',
        count: 2,
        value: '$3,200',
        color: 'border-slate-400',
        invoices: [{
          id: 'INV-0163',
          client: 'NewCo',
          amount: '$1,800',
          status: 'draft',
          date: 'Created Today'
        }, {
          id: 'INV-0164',
          client: 'StartUp',
          amount: '$1,400',
          status: 'draft',
          date: 'Created Yesterday'
        }]
      }, {
        title: 'SENT',
        count: 5,
        value: '$10,200',
        color: 'border-blue-500',
        invoices: [{
          id: 'INV-0160',
          client: 'Delta Co',
          amount: '$4,800',
          status: 'sent',
          date: 'Due Jan 15'
        }, {
          id: 'INV-0156',
          client: 'TechStart',
          amount: '$2,800',
          status: 'sent',
          date: 'Due Fri'
        }]
      }, {
        title: 'OVERDUE',
        count: 3,
        value: '$8,200',
        color: 'border-red-500',
        invoices: [{
          id: 'INV-0142',
          client: 'Acme Corp',
          amount: '$4,500',
          status: 'overdue',
          date: 'Due Dec 1',
          daysOverdue: 32
        }, {
          id: 'INV-0148',
          client: 'Beta Inc',
          amount: '$3,700',
          status: 'overdue',
          date: 'Due Dec 14',
          daysOverdue: 18
        }]
      }, {
        title: 'PARTIALLY PAID',
        count: 1,
        value: '$2,400',
        color: 'border-amber-500',
        invoices: [{
          id: 'INV-0155',
          client: 'BigClient',
          amount: '$2,400',
          status: 'partial',
          date: '$1,200 remaining'
        }]
      }].map((column, i) => <div key={i} className="w-80 flex-shrink-0 flex flex-col">
              <div className={`bg-slate-100 rounded-t-xl p-4 border-t-4 ${column.color} shrink-0 mb-3`}>
                <div className="flex justify-between items-center mb-1">
                  <h3 className="font-bold text-slate-700 text-sm">
                    {column.title}
                  </h3>
                  <span className="text-xs font-medium text-slate-500">
                    {column.count} invoices
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-900">
                    {column.value}
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                {column.invoices.map((invoice, j) => <InvoiceCard key={j} {...invoice as any} onClick={() => onNavigate('invoice-detail')} />)}
              </div>
            </div>)}
        </div>}
    </motion.div>;
}