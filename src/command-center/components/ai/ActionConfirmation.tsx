// ============================================
// ACTION CONFIRMATION
// Human-in-the-loop confirmation card for AI actions requiring approval
// CC-AI-CONFIRM: Inline confirmation widget
// ============================================

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Edit3, Loader2, AlertTriangle } from 'lucide-react';
import { AI_ACTIONS } from '../../services/ai-actions';
import type { MessageToolCall } from '../../hooks/useAccountManager';

interface ActionConfirmationProps {
  toolCall: MessageToolCall;
  onApprove: (confirmationId: string) => void;
  onCancel: (confirmationId: string) => void;
}

// Human-readable labels for common parameter keys
const PARAM_LABELS: Record<string, string> = {
  customer_id: 'Customer ID',
  deal_id: 'Deal ID',
  product_tier: 'Product Tier',
  scheduled_at: 'Scheduled At',
  due_date: 'Due Date',
  customer_name: 'Customer',
  business_name: 'Business',
  subject: 'Email Subject',
  title: 'Task Title',
  platform: 'Platform',
  topic: 'Topic',
  tone: 'Tone',
  purpose: 'Purpose',
  notes: 'Notes',
  stage: 'New Stage',
  pain_points: 'Pain Points',
  industry: 'Industry',
};

function ParamRow({ k, v }: { k: string; v: unknown }) {
  const label = PARAM_LABELS[k] ?? k.replace(/_/g, ' ');
  const value = String(v ?? '');
  if (!value) return null;
  return (
    <div className="flex gap-2 text-sm py-1 border-b border-slate-100 dark:border-slate-700/50 last:border-0">
      <dt className="text-[11px] text-slate-400 dark:text-slate-500 uppercase tracking-wider w-24 flex-shrink-0 mt-0.5">
        {label}
      </dt>
      <dd className="text-slate-700 dark:text-slate-300 break-words min-w-0 flex-1">
        {value}
      </dd>
    </div>
  );
}

export function ActionConfirmation({ toolCall, onApprove, onCancel }: ActionConfirmationProps) {
  const [isExecuting, setIsExecuting] = useState(false);
  const action = AI_ACTIONS[toolCall.name];

  if (toolCall.status === 'executed') {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-sm mt-2">
        <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
        <span className="font-medium">{action?.label ?? toolCall.name} — completed</span>
      </div>
    );
  }

  if (toolCall.status === 'cancelled') {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-sm mt-2">
        <XCircle className="w-4 h-4 flex-shrink-0" />
        <span>Action cancelled</span>
      </div>
    );
  }

  if (toolCall.status === 'approved') {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 text-sm mt-2">
        <Loader2 className="w-4 h-4 flex-shrink-0 animate-spin" />
        <span className="font-medium">Executing {action?.label ?? toolCall.name}…</span>
      </div>
    );
  }

  const handleApprove = () => {
    setIsExecuting(true);
    onApprove(toolCall.confirmationId);
  };

  const hasParams = Object.keys(toolCall.arguments).length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="mt-3 rounded-xl border border-amber-200 dark:border-amber-800/60 bg-amber-50/80 dark:bg-amber-900/10 overflow-hidden shadow-sm"
      role="group"
      aria-label={`Confirm action: ${action?.label ?? toolCall.name}`}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-amber-200 dark:border-amber-800/50 bg-amber-100/50 dark:bg-amber-900/20">
        <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-amber-900 dark:text-amber-300">
            {action?.label ?? toolCall.name}
          </p>
          {action?.description && (
            <p className="text-xs text-amber-700 dark:text-amber-400/80 mt-0.5">
              {action.description}
            </p>
          )}
        </div>
      </div>

      {/* Parameters */}
      {hasParams && (
        <div className="px-4 py-3">
          <dl className="space-y-0">
            {Object.entries(toolCall.arguments).map(([k, v]) => (
              <ParamRow key={k} k={k} v={v} />
            ))}
          </dl>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 px-4 py-3 border-t border-amber-200 dark:border-amber-800/50 bg-white/40 dark:bg-slate-900/20">
        <button
          type="button"
          onClick={handleApprove}
          disabled={isExecuting}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          aria-label="Approve and execute action"
        >
          {isExecuting ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <CheckCircle2 className="w-3.5 h-3.5" />
          )}
          Approve
        </button>

        <button
          type="button"
          onClick={() => onCancel(toolCall.confirmationId)}
          disabled={isExecuting}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold border border-slate-200 dark:border-slate-600 shadow-sm transition-colors disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-slate-400"
          aria-label="Cancel action"
        >
          <XCircle className="w-3.5 h-3.5" />
          Cancel
        </button>
      </div>
    </motion.div>
  );
}
