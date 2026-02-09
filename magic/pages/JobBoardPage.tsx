import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, ChevronDown, Layout, List, Calendar, TrendingUp } from 'lucide-react';
import { JobCard } from '../components/JobCard';
export function JobBoardPage({
  onNavigate
}: {
  onNavigate: (page: string) => void;
}) {
  const columns = [{
    id: 'quote',
    title: 'QUOTE SENT',
    value: '$9,400',
    count: 5,
    color: 'border-blue-500',
    jobs: [{
      id: 1,
      client: 'Smith',
      service: 'Water htr',
      price: '$2,400',
      status: '5 days',
      action: 'invoice',
      urgency: 'low'
    }, {
      id: 2,
      client: 'Davis',
      service: 'Bathroom',
      price: '$5,800',
      status: '11 days ⚠️',
      action: 'invoice',
      urgency: 'medium'
    }]
  }, {
    id: 'scheduled',
    title: 'SCHEDULED',
    value: '$4,200',
    count: 8,
    color: 'border-indigo-500',
    jobs: [{
      id: 3,
      client: 'Johnson',
      service: 'Emergency',
      price: '$175',
      status: 'Today 2pm',
      action: 'start',
      urgency: 'high'
    }, {
      id: 4,
      client: 'ABC Corp',
      service: 'Maint.',
      price: '$250',
      status: 'Tom. 9am',
      action: 'start',
      urgency: 'low'
    }]
  }, {
    id: 'progress',
    title: 'IN PROGRESS',
    value: '$680',
    count: 2,
    color: 'border-purple-500',
    jobs: [{
      id: 5,
      client: 'Chen',
      service: 'Pipe fix',
      price: '$280',
      status: 'Started',
      action: 'complete',
      urgency: 'medium'
    }]
  }, {
    id: 'complete',
    title: 'COMPLETE',
    value: '$920',
    count: 3,
    color: 'border-emerald-500',
    jobs: [{
      id: 6,
      client: 'Adams',
      service: 'Inspection',
      price: '$75',
      status: 'Done ✓',
      action: 'invoice',
      urgency: 'low'
    }, {
      id: 7,
      client: 'Brown',
      service: 'Kitchen',
      price: '$320',
      status: 'Done ✓',
      action: 'invoice',
      urgency: 'low'
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
        <h1 className="text-2xl font-bold text-slate-900">📋 Job Board</h1>
        <button onClick={() => onNavigate('quote-new')} className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Quote
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
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg w-64">
              <Search className="w-4 h-4 text-slate-400" />
              <input type="text" placeholder="Search jobs..." className="bg-transparent outline-none text-sm flex-1" />
            </div>

            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 rounded-lg text-sm font-medium text-slate-700 flex items-center gap-1">
                Client <ChevronDown className="w-4 h-4" />
              </button>
              <button className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 rounded-lg text-sm font-medium text-slate-700 flex items-center gap-1">
                Date <ChevronDown className="w-4 h-4" />
              </button>
              <button className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 rounded-lg text-sm font-medium text-slate-700 flex items-center gap-1">
                Assignee <ChevronDown className="w-4 h-4" />
              </button>
              <button className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 rounded-lg text-sm font-medium text-slate-700">
                <Filter className="w-4 h-4" />
              </button>
            </div>
          </div>
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
                    {column.count} jobs
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-900">
                    {column.value}
                  </span>
                </div>
              </div>

              {/* Jobs List */}
              <div className="bg-slate-50/50 border-x border-b border-slate-200 rounded-b-xl p-3 flex-1 overflow-y-auto space-y-3">
                {column.jobs.map(job => <JobCard key={job.id} {...job} action={job.action as any} urgency={job.urgency as any} onClick={() => onNavigate('job-detail')} />)}
                <button className="w-full py-2 border-2 border-dashed border-slate-200 rounded-lg text-slate-400 hover:border-blue-300 hover:text-blue-500 hover:bg-blue-50 transition-all text-sm font-medium flex items-center justify-center gap-1">
                  <Plus className="w-4 h-4" /> New Job
                </button>
              </div>
            </div>)}

          {/* Invoiced Column (Collapsed) */}
          <div className="w-24 bg-emerald-50 rounded-xl border border-emerald-100 flex flex-col items-center py-4 cursor-pointer hover:bg-emerald-100 transition-colors">
            <div className="text-center mb-4">
              <p className="text-xs font-bold text-emerald-700">INVOICED</p>
              <p className="text-xs text-emerald-600 mt-1">This Week</p>
              <p className="text-sm font-bold text-emerald-800">$4,200</p>
            </div>
            <div className="writing-vertical text-emerald-800 font-bold text-sm tracking-wide rotate-180 flex-1 flex items-center justify-center" style={{
            writingMode: 'vertical-rl'
          }}>
              collected
            </div>
          </div>
        </div>
      </div>
    </motion.div>;
}