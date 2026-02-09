import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, ChevronDown, Layout, List, Calendar, TrendingUp } from 'lucide-react';
import { DealCard } from '../components/DealCard';
export function PipelinePage({
  onNavigate
}: {
  onNavigate: (page: string) => void;
}) {
  const columns = [{
    id: 'lead',
    title: 'LEAD',
    value: '$45,000',
    count: 12,
    color: 'border-blue-500',
    deals: [{
      id: 1,
      company: 'Acme Co',
      title: 'Q1 Service',
      amount: '$15,000',
      probability: 70,
      owner: 'Sarah M.',
      dueDate: 'Jan 15',
      priority: 'high',
      nextAction: {
        type: 'call',
        date: 'Jan 15',
        status: 'overdue'
      }
    }, {
      id: 2,
      company: 'Beta Inc',
      title: 'Annual Contract',
      amount: '$8,000',
      probability: 30,
      owner: 'John D.',
      dueDate: 'Feb 1',
      priority: 'medium',
      nextAction: {
        type: 'email',
        date: 'Jan 8',
        status: 'upcoming'
      }
    }]
  }, {
    id: 'qualified',
    title: 'QUALIFIED',
    value: '$38,000',
    count: 8,
    color: 'border-indigo-500',
    deals: [{
      id: 3,
      company: 'TechStart',
      title: 'Implementation',
      amount: '$22,000',
      probability: 40,
      owner: 'John D.',
      dueDate: 'Jan 20',
      priority: 'medium',
      nextAction: {
        type: 'email',
        date: 'Jan 8',
        status: 'today'
      }
    }, {
      id: 4,
      company: 'Gamma LLC',
      title: 'Consulting',
      amount: '$12,000',
      probability: 50,
      owner: 'Bob T.',
      dueDate: 'Jan 25',
      priority: 'low',
      nextAction: {
        type: 'meeting',
        date: 'Jan 10',
        status: 'upcoming'
      }
    }]
  }, {
    id: 'proposal',
    title: 'PROPOSAL',
    value: '$42,000',
    count: 5,
    color: 'border-purple-500',
    deals: [{
      id: 5,
      company: 'BigCorp',
      title: 'Enterprise Plan',
      amount: '$25,000',
      probability: 60,
      owner: 'Sarah M.',
      dueDate: 'Jan 30',
      priority: 'high',
      nextAction: {
        type: 'meeting',
        date: 'Today',
        status: 'today'
      }
    }, {
      id: 6,
      company: 'Epsilon',
      title: 'Renewal',
      amount: '$17,000',
      probability: 55,
      owner: 'Sarah M.',
      dueDate: 'Feb 5',
      priority: 'medium',
      nextAction: {
        type: 'call',
        date: 'Jan 12',
        status: 'upcoming'
      }
    }]
  }, {
    id: 'negotiation',
    title: 'NEGOTIATION',
    value: '$31,000',
    count: 3,
    color: 'border-emerald-500',
    deals: [{
      id: 7,
      company: 'Delta',
      title: 'Service Agreement',
      amount: '$18,000',
      probability: 80,
      owner: 'Bob T.',
      dueDate: 'Jan 10',
      priority: 'high',
      nextAction: {
        type: 'task',
        date: 'Jan 10',
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
        <h1 className="text-2xl font-bold text-slate-900">💼 Pipeline</h1>
        <button onClick={() => onNavigate('deal-detail')} className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Deal
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 mb-6 shrink-0">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
              <button className="p-1.5 bg-white shadow-sm rounded text-blue-600">
                <Layout className="w-4 h-4" />
              </button>
              <button className="p-1.5 text-slate-500 hover:text-slate-700">
                <List className="w-4 h-4" />
              </button>
              <button className="p-1.5 text-slate-500 hover:text-slate-700">
                <Calendar className="w-4 h-4" />
              </button>
              <button className="p-1.5 text-slate-500 hover:text-slate-700">
                <TrendingUp className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg w-64">
              <Search className="w-4 h-4 text-slate-400" />
              <input type="text" placeholder="Search deals..." className="bg-transparent outline-none text-sm flex-1" />
            </div>

            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 rounded-lg text-sm font-medium text-slate-700 flex items-center gap-1">
                Owner <ChevronDown className="w-4 h-4" />
              </button>
              <button className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 rounded-lg text-sm font-medium text-slate-700 flex items-center gap-1">
                Account <ChevronDown className="w-4 h-4" />
              </button>
              <button className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 rounded-lg text-sm font-medium text-slate-700">
                <Filter className="w-4 h-4" />
              </button>
            </div>
          </div>

          <button className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 rounded-lg text-sm font-medium text-slate-700 flex items-center gap-1">
            Group By <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="flex gap-4 h-full min-w-max pb-4">
          {columns.map(column => <div key={column.id} className="w-80 flex flex-col h-full">
              {/* Column Header */}
              <div className={`bg-slate-100 rounded-t-xl p-4 border-t-4 ${column.color} shrink-0`}>
                <div className="flex justify-between items-center mb-1">
                  <h3 className="font-bold text-slate-700 text-sm">
                    {column.title}
                  </h3>
                  <span className="text-xs font-medium text-slate-500">
                    {column.count} deals
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-900">
                    {column.value}
                  </span>
                  <div className="h-1.5 w-16 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-slate-400 w-2/3" />
                  </div>
                </div>
              </div>

              {/* Deals List */}
              <div className="bg-slate-50/50 border-x border-b border-slate-200 rounded-b-xl p-3 flex-1 overflow-y-auto space-y-3">
                {column.deals.map(deal => <DealCard key={deal.id} {...deal} onClick={() => onNavigate('deal-detail')} />)}
                <button className="w-full py-2 border-2 border-dashed border-slate-200 rounded-lg text-slate-400 hover:border-blue-300 hover:text-blue-500 hover:bg-blue-50 transition-all text-sm font-medium flex items-center justify-center gap-1">
                  <Plus className="w-4 h-4" /> New Deal
                </button>
              </div>
            </div>)}

          {/* Won Column (Collapsed) */}
          <div className="w-12 bg-emerald-50 rounded-xl border border-emerald-100 flex flex-col items-center py-4 cursor-pointer hover:bg-emerald-100 transition-colors">
            <div className="writing-vertical text-emerald-800 font-bold text-sm tracking-wide rotate-180" style={{
            writingMode: 'vertical-rl'
          }}>
              WON DEALS
            </div>
          </div>
        </div>
      </div>
    </motion.div>;
}