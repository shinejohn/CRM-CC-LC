import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, ChevronDown, Layout, List, Calendar, TrendingUp, CheckCircle2, Clock } from 'lucide-react';
import { DealCard } from '../components/DealCard';
export function QuotesListPage({
  onNavigate
}: {
  onNavigate: (page: string) => void;
}) {
  const [viewMode, setViewMode] = useState<'list' | 'board'>('board');
  const columns = [{
    id: 'draft',
    title: 'DRAFT',
    value: '$24,000',
    count: 3,
    color: 'border-slate-400',
    quotes: [{
      id: 1,
      company: 'NewCo',
      title: 'PROP-0095',
      amount: '$12,000',
      probability: 50,
      owner: 'Sarah M.',
      dueDate: 'Jan 15',
      priority: 'medium',
      nextAction: {
        type: 'email',
        date: 'Today',
        status: 'today'
      }
    }]
  }, {
    id: 'sent',
    title: 'SENT',
    value: '$68,000',
    count: 8,
    color: 'border-blue-500',
    quotes: [{
      id: 2,
      company: 'Acme Corp',
      title: 'PROP-0089',
      amount: '$25,000',
      probability: 70,
      owner: 'Sarah M.',
      dueDate: 'Jan 20',
      priority: 'high',
      nextAction: {
        type: 'call',
        date: 'Jan 10',
        status: 'upcoming'
      }
    }]
  }, {
    id: 'viewed',
    title: 'VIEWED',
    value: '$42,000',
    count: 5,
    color: 'border-purple-500',
    quotes: [{
      id: 3,
      company: 'TechStart',
      title: 'PROP-0087',
      amount: '$18,000',
      probability: 80,
      owner: 'John D.',
      dueDate: 'Jan 12',
      priority: 'high',
      nextAction: {
        type: 'call',
        date: 'Today',
        status: 'today'
      }
    }]
  }, {
    id: 'accepted',
    title: 'ACCEPTED',
    value: '$22,000',
    count: 2,
    color: 'border-emerald-500',
    quotes: [{
      id: 4,
      company: 'Gamma LLC',
      title: 'PROP-0082',
      amount: '$8,500',
      probability: 100,
      owner: 'Bob T.',
      dueDate: 'Jan 5',
      priority: 'low',
      nextAction: {
        type: 'task',
        date: 'Done',
        status: 'upcoming'
      }
    }]
  }];
  return <motion.div initial={{
    opacity: 0,
    y: 20
  }} animate={{
    opacity: 1,
    y: 0
  }} className="h-[calc(100vh-6rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 shrink-0">
        <h1 className="text-2xl font-bold text-slate-900">📄 Proposals</h1>
        <button onClick={() => onNavigate('quote-new')} className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Proposal
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6 shrink-0">
        {[{
        label: 'Open Value',
        value: '$156,000',
        subtext: '18 proposals',
        icon: TrendingUp,
        color: 'text-blue-600',
        bg: 'bg-blue-100'
      }, {
        label: 'Pending Response',
        value: '12',
        subtext: 'Avg: 5 days',
        icon: Clock,
        color: 'text-amber-600',
        bg: 'bg-amber-100'
      }, {
        label: 'Accepted This Month',
        value: '8',
        subtext: '$42,000',
        icon: CheckCircle2,
        color: 'text-emerald-600',
        bg: 'bg-emerald-100'
      }, {
        label: 'Conversion Rate',
        value: '62%',
        subtext: '▲ +5%',
        icon: TrendingUp,
        color: 'text-purple-600',
        bg: 'bg-purple-100'
      }].map((metric, i) => <div key={i} className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
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
          </div>)}
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 mb-6 shrink-0">
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
              <input type="text" placeholder="Search proposals..." className="bg-transparent outline-none text-sm flex-1" />
            </div>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="flex gap-4 h-full min-w-max pb-4">
          {columns.map(column => <div key={column.id} className="w-80 flex flex-col h-full">
              <div className={`bg-slate-100 rounded-t-xl p-4 border-t-4 ${column.color} shrink-0 mb-3`}>
                <div className="flex justify-between items-center mb-1">
                  <h3 className="font-bold text-slate-700 text-sm">
                    {column.title}
                  </h3>
                  <span className="text-xs font-medium text-slate-500">
                    {column.count} proposals
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-900">
                    {column.value}
                  </span>
                </div>
              </div>
              <div className="space-y-3 overflow-y-auto flex-1 pr-2">
                {column.quotes.map(quote => <DealCard key={quote.id} {...quote as any} onClick={() => onNavigate('quote-detail')} />)}
              </div>
            </div>)}
        </div>
      </div>
    </motion.div>;
}