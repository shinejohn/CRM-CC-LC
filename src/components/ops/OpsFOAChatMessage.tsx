// ============================================
// OpsFOAChatMessage - FOA chat message component
// ============================================

import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Bot, User, Check, X } from 'lucide-react';
import type { FOAMessage, FOAActionSuggestion } from '@/types/ops';

interface OpsFOAChatMessageProps {
  message: FOAMessage;
  onApprove?: (suggestion: FOAActionSuggestion) => void;
  onReject?: (suggestion: FOAActionSuggestion) => void;
}

export function OpsFOAChatMessage({
  message,
  onApprove,
  onReject,
}: OpsFOAChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
    >
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser ? 'bg-indigo-100 dark:bg-indigo-900/30' : 'bg-gray-100 dark:bg-slate-700'
        }`}
      >
        {isUser ? (
          <User className="w-4 h-4 text-indigo-600" />
        ) : (
          <Bot className="w-4 h-4 text-gray-600 dark:text-slate-300" />
        )}
      </div>
      <div
        className={`flex-1 min-w-0 max-w-[85%] ${
          isUser
            ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-900 dark:text-indigo-100'
            : 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700'
        } rounded-lg px-4 py-3`}
      >
        <div className="prose prose-sm dark:prose-invert max-w-none">
          {isUser ? (
            <p className="m-0">{message.content}</p>
          ) : (
            <ReactMarkdown>{message.content}</ReactMarkdown>
          )}
        </div>
        {!isUser && message.actionSuggestions && message.actionSuggestions.length > 0 && (
          <div className="mt-3 space-y-2">
            {message.actionSuggestions.map((s) => (
              <div
                key={s.id}
                className="p-3 rounded border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700/50"
              >
                <p className="font-medium text-sm text-gray-900 dark:text-white">{s.title}</p>
                {s.description && (
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                    {s.description}
                  </p>
                )}
                <div className="flex gap-2 mt-2">
                  {onApprove && (
                    <button
                      onClick={() => onApprove(s)}
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-800/50"
                    >
                      <Check className="w-3 h-3" />
                      Approve
                    </button>
                  )}
                  {onReject && (
                    <button
                      onClick={() => onReject(s)}
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-800/50"
                    >
                      <X className="w-3 h-3" />
                      Reject
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        <p className="text-xs text-gray-400 dark:text-slate-500 mt-2">
          {message.timestamp.toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
}
