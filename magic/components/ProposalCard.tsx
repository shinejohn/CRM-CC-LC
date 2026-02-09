import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, DollarSign, FileText, MessageSquare, CheckCircle } from 'lucide-react';
interface ProposalCardProps {
  proposal: {
    id: string;
    title: string;
    icon: string;
    status: 'review' | 'pending' | 'accepted' | 'declined';
    summary: string;
    impact: string[];
    investment: string;
    roi: string;
  };
  index: number;
}
export function ProposalCard({
  proposal,
  index
}: ProposalCardProps) {
  const statusConfig = {
    review: {
      bg: 'bg-amber-100',
      text: 'text-amber-700',
      border: 'border-amber-200',
      label: 'REVIEW'
    },
    pending: {
      bg: 'bg-slate-100',
      text: 'text-slate-600',
      border: 'border-slate-200',
      label: 'PENDING'
    },
    accepted: {
      bg: 'bg-emerald-100',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
      label: 'ACCEPTED'
    },
    declined: {
      bg: 'bg-red-100',
      text: 'text-red-700',
      border: 'border-red-200',
      label: 'DECLINED'
    }
  };
  const status = statusConfig[proposal.status];
  return <motion.div initial={{
    opacity: 0,
    y: 20
  }} animate={{
    opacity: 1,
    y: 0
  }} transition={{
    delay: index * 0.1
  }} whileHover={{
    y: -2
  }} className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 flex flex-col">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{proposal.icon}</span>
          <h3 className="font-bold text-slate-900">{proposal.title}</h3>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${status.bg} ${status.text} ${status.border}`}>
          {status.label}
        </span>
      </div>

      <div className="h-px bg-slate-100 mb-4" />

      <p className="text-sm text-slate-600 mb-6 leading-relaxed">
        {proposal.summary}
      </p>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-100">
          <h4 className="text-xs font-bold text-emerald-700 uppercase tracking-wide mb-2">
            Projected Impact
          </h4>
          <ul className="space-y-1">
            {proposal.impact.map((item, i) => <li key={i} className="text-sm text-emerald-900 font-medium flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> {item}
              </li>)}
          </ul>
        </div>
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
          <h4 className="text-xs font-bold text-blue-700 uppercase tracking-wide mb-2">
            Investment
          </h4>
          <p className="text-2xl font-bold text-blue-900">
            {proposal.investment}
          </p>
          <p className="text-xs text-blue-600 mt-1">Monthly cost</p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-lg p-4 mb-6 border border-emerald-100">
        <div className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-emerald-600" />
          <span className="text-sm font-medium text-slate-600">ROI:</span>
          <span className="text-lg font-bold text-emerald-600">
            {proposal.roi}
          </span>
        </div>
      </div>

      <div className="flex gap-2 mt-auto">
        <button className="flex-1 py-2 px-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-100 transition-colors flex items-center justify-center gap-1">
          <FileText className="w-4 h-4" /> View Full
        </button>
        {proposal.status === 'review' && <>
            <button className="flex-1 py-2 px-3 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-1 shadow-sm">
              <CheckCircle className="w-4 h-4" /> Accept
            </button>
            <button className="py-2 px-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-100 transition-colors">
              <MessageSquare className="w-4 h-4" />
            </button>
          </>}
        {proposal.status === 'accepted' && <button className="flex-1 py-2 px-3 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors flex items-center justify-center gap-1">
            <CheckCircle className="w-4 h-4" /> In Progress
          </button>}
      </div>
    </motion.div>;
}