import React from 'react';
import { motion } from 'framer-motion';
import { FileText } from 'lucide-react';

interface ProposalCardListProps {
  id: string;
  quoteNumber: string;
  company: string;
  amount: string;
  status: string;
  dueDate: string;
  onClick?: () => void;
}

export function ProposalCard(props: ProposalCardListProps) {
  const { id, quoteNumber, company, amount, status, dueDate, onClick } = props;

  const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
    draft: { bg: 'bg-slate-100', text: 'text-slate-700', label: 'Draft' },
    sent: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Sent' },
    viewed: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Viewed' },
    accepted: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Accepted' },
    rejected: { bg: 'bg-red-100', text: 'text-red-700', label: 'Rejected' },
  };
  const config = statusConfig[status] || statusConfig.draft;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className="cursor-pointer bg-white rounded-xl p-4 shadow-sm border border-slate-100 hover:border-slate-200"
    >
      <div className="flex justify-between items-start mb-2">
        <span className="font-mono font-medium text-slate-900 text-sm">{quoteNumber}</span>
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
          {config.label}
        </span>
      </div>
      <p className="text-sm font-medium text-slate-900 mb-1 truncate">{company}</p>
      <div className="flex justify-between items-center">
        <span className="font-bold text-slate-900">{amount}</span>
        <span className="text-xs text-slate-500">{dueDate}</span>
      </div>
    </motion.div>
  );
}
