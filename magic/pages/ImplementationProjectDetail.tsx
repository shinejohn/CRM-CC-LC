import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, Circle, Clock, FileText, MessageSquare, Download } from 'lucide-react';
export function ImplementationProjectDetail({
  onBack
}: {
  onBack: () => void;
}) {
  return <motion.div initial={{
    opacity: 0,
    y: 20
  }} animate={{
    opacity: 1,
    y: 0
  }} className="max-w-4xl mx-auto pb-12 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to AI Consulting
        </button>
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">
          🚀 Implementation: Email Automation Setup
        </h1>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <div className="flex justify-between items-end mb-2">
          <div>
            <span className="text-3xl font-bold text-slate-900">75%</span>
            <span className="text-slate-500 ml-2">complete</span>
          </div>
          <span className="text-sm font-medium text-emerald-600 flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4" /> On Track
          </span>
        </div>
        <div className="h-3 bg-slate-100 rounded-full overflow-hidden mb-4">
          <div className="h-full bg-blue-600 rounded-full w-[75%]" />
        </div>
        <div className="flex justify-between text-sm text-slate-500">
          <span>Started: Dec 20, 2024</span>
          <span>Est. Completion: Dec 30, 2024</span>
        </div>
      </div>

      {/* Overview */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-4">
          Overview
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between py-2 border-b border-slate-50">
            <span className="text-slate-600">Project</span>
            <span className="font-medium text-slate-900">
              Set up automated email sequences for customer lifecycle
            </span>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-50">
            <span className="text-slate-600">Assigned To</span>
            <span className="font-medium text-slate-900">
              Sarah (Marketing Manager)
            </span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-slate-600">Source</span>
            <span className="font-medium text-slate-900">
              Proposal "Q4 Marketing Optimization"
            </span>
          </div>
        </div>
      </div>

      {/* Tasks */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-4">
          Tasks
        </h3>
        <div className="space-y-4">
          {[{
          name: 'Audit existing email templates',
          date: 'Dec 20',
          status: 'done'
        }, {
          name: 'Design welcome sequence (5 emails)',
          date: 'Dec 22',
          status: 'done'
        }, {
          name: 'Design re-engagement sequence (3 emails)',
          date: 'Dec 24',
          status: 'done'
        }, {
          name: 'Set up automation triggers',
          date: 'Dec 28',
          status: 'in-progress',
          progress: '75%'
        }, {
          name: 'Test all sequences',
          date: 'Dec 29',
          status: 'pending'
        }, {
          name: 'Launch and monitor',
          date: 'Dec 30',
          status: 'pending'
        }].map((task, i) => <div key={i} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors">
              <div className="flex items-center gap-3">
                {task.status === 'done' ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : task.status === 'in-progress' ? <div className="w-5 h-5 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" /> : <Circle className="w-5 h-5 text-slate-300" />}
                <span className={`font-medium ${task.status === 'done' ? 'text-slate-500 line-through' : 'text-slate-900'}`}>
                  {task.name}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-slate-500">{task.date}</span>
                <span className={`font-bold w-20 text-right ${task.status === 'done' ? 'text-emerald-600' : task.status === 'in-progress' ? 'text-blue-600' : 'text-slate-400'}`}>
                  {task.status === 'done' ? 'Done' : task.status === 'in-progress' ? task.progress : '0%'}
                </span>
              </div>
            </div>)}
        </div>
      </div>

      {/* Recent Updates */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-4">
          Recent Updates
        </h3>
        <div className="space-y-6 relative pl-4 border-l-2 border-slate-100 ml-2">
          <div className="relative">
            <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-blue-600 border-2 border-white shadow-sm" />
            <p className="text-xs text-slate-500 mb-1">
              Dec 28, 10:30 AM - Sarah
            </p>
            <p className="text-slate-700 text-sm bg-slate-50 p-3 rounded-lg border border-slate-100">
              "Automation triggers are 75% complete. Setting up the final
              trigger for abandoned cart recovery. Should be done by EOD."
            </p>
          </div>
          <div className="relative">
            <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-slate-300 border-2 border-white shadow-sm" />
            <p className="text-xs text-slate-500 mb-1">
              Dec 24, 3:00 PM - Sarah
            </p>
            <p className="text-slate-700 text-sm bg-slate-50 p-3 rounded-lg border border-slate-100">
              "Re-engagement sequence complete! 3 emails designed to win back
              customers who haven't ordered in 60+ days."
            </p>
          </div>
        </div>
        <button className="mt-4 text-sm font-medium text-blue-600 hover:underline pl-6">
          View All Updates
        </button>
      </div>

      {/* Deliverables */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-4">
          Deliverables
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 border border-slate-100 rounded-lg">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <span className="font-medium text-slate-900">
                Welcome Sequence (5 emails)
              </span>
            </div>
            <button className="text-sm font-medium text-blue-600 hover:underline">
              Preview
            </button>
          </div>
          <div className="flex items-center justify-between p-3 border border-slate-100 rounded-lg">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <span className="font-medium text-slate-900">
                Re-engagement Sequence (3 emails)
              </span>
            </div>
            <button className="text-sm font-medium text-blue-600 hover:underline">
              Preview
            </button>
          </div>
          <div className="flex items-center justify-between p-3 border border-slate-100 rounded-lg opacity-60">
            <div className="flex items-center gap-3">
              <Circle className="w-5 h-5 text-slate-300" />
              <span className="font-medium text-slate-900">
                Automation Configuration
              </span>
            </div>
            <span className="text-sm text-slate-500">In Progress</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <button className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center justify-center gap-2">
          <MessageSquare className="w-4 h-4" /> Message Sarah
        </button>
        <button className="flex-1 py-3 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
          <Clock className="w-4 h-4" /> Request Update
        </button>
        <button className="flex-1 py-3 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
          <FileText className="w-4 h-4" /> View Original Proposal
        </button>
      </div>
    </motion.div>;
}