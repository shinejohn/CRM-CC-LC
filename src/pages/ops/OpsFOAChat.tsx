// ============================================
// Ops FOA Chat - Chat interface with FOA agent
// Natural language queries, action suggestions
// ============================================

import React, { useState, useRef, useEffect } from 'react';
import { useOpsFOA } from '@/hooks/ops/useOpsFOA';
import { OpsFOAChatMessage } from '@/components/ops/OpsFOAChatMessage';
import { Send, Bot, Trash2 } from 'lucide-react';
import type { FOAActionSuggestion } from '@/types/ops';

export function OpsFOAChat() {
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const {
    messages,
    sendMessage,
    isLoading,
    error,
    approveAction,
    rejectAction,
    clearSession,
  } = useOpsFOA();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    sendMessage(trimmed);
    setInput('');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Bot className="w-7 h-7 text-indigo-600" />
          FOA Chat
        </h1>
        <button
          onClick={clearSession}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700"
        >
          <Trash2 className="w-4 h-4" />
          Clear session
        </button>
      </div>

      <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">
        Ask FOA natural language questions. Try &quot;What&apos;s our current churn rate?&quot; or
        &quot;Why did deliverability drop?&quot;
      </p>

      <div className="flex-1 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-12 text-gray-500 dark:text-slate-400">
              <Bot className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Start a conversation with FOA</p>
            </div>
          )}
          {messages.map((m) => (
            <OpsFOAChatMessage
              key={m.id}
              message={m}
              onApprove={
                m.actionSuggestions?.length
                  ? (s: FOAActionSuggestion) => approveAction({ id: s.id })
                  : undefined
              }
              onReject={
                m.actionSuggestions?.length
                  ? (s: FOAActionSuggestion) =>
                      rejectAction({ id: s.id, notes: 'Rejected by user' })
                  : undefined
              }
            />
          ))}
          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center">
                <Bot className="w-4 h-4 text-gray-500" />
              </div>
              <div className="bg-gray-100 dark:bg-slate-700 rounded-lg px-4 py-2">
                <span className="animate-pulse">Thinking...</span>
              </div>
            </div>
          )}
          {error && (
            <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-3 text-red-700 dark:text-red-200 text-sm">
              {error instanceof Error ? error.message : 'Something went wrong'}
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 dark:border-slate-700">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask FOA..."
              disabled={isLoading}
              className="flex-1 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2 focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
