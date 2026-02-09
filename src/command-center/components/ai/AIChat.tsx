// ============================================
// AI CHAT COMPONENT - Command Center
// CC-SVC-06: AI Assistant Service
// ============================================

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Mic, Paperclip, RefreshCw, StopCircle, Sparkles } from 'lucide-react';
import { useAI } from '../../hooks/useAI';
import { AIMessage } from '../../services/ai.types';

interface AIChatProps {
  className?: string;
  context?: any;
  personalityId?: string;
  onToolCall?: (toolCall: any) => void;
}

export function AIChat({ className, context, personalityId, onToolCall }: AIChatProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const {
    messages,
    isLoading,
    isStreaming,
    error,
    sendMessage,
    regenerate,
    abortStream,
  } = useAI({
    context,
    personalityId,
    onToolCall,
  });

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    const message = input;
    setInput('');
    await sendMessage(message);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <EmptyState />
        ) : (
          messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))
        )}
        
        {isLoading && !isStreaming && (
          <LoadingIndicator />
        )}
        
        {error && (
          <ErrorMessage error={error} onRetry={regenerate} />
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 dark:border-slate-700 p-4">
        <form onSubmit={handleSubmit} className="relative">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything..."
            className="w-full min-h-[44px] max-h-[200px] px-4 py-2 pr-24 resize-none rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
            rows={1}
          />
          
          <div className="absolute right-2 bottom-2 flex items-center gap-1">
            <button
              type="button"
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded transition-colors disabled:opacity-50"
              disabled={isLoading}
              title="Attach file"
            >
              <Paperclip className="w-4 h-4" />
            </button>
            
            <button
              type="button"
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded transition-colors disabled:opacity-50"
              disabled={isLoading}
              title="Voice input"
            >
              <Mic className="w-4 h-4" />
            </button>
            
            {isStreaming ? (
              <button
                type="button"
                className="p-2 text-red-500 hover:text-red-600 rounded transition-colors"
                onClick={abortStream}
                title="Stop streaming"
              >
                <StopCircle className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                className="p-2 bg-purple-500 hover:bg-purple-600 text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!input.trim() || isLoading}
                title="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

// Sub-components
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-4">
        <Sparkles className="w-8 h-8 text-purple-500" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        AI Assistant Ready
      </h3>
      <p className="text-sm text-gray-500 dark:text-slate-400 max-w-sm">
        Ask me anything about your business, customers, or content. I can help you draft emails, analyze data, and more.
      </p>
    </div>
  );
}

function MessageBubble({ message }: { message: AIMessage }) {
  const isUser = message.role === 'user';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`
          max-w-[80%] rounded-2xl px-4 py-3
          ${isUser
            ? 'bg-purple-500 text-white'
            : 'bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-white'
          }
        `}
      >
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        
        {message.metadata?.toolCalls && message.metadata.toolCalls.length > 0 && (
          <div className="mt-2 pt-2 border-t border-white/20">
            {message.metadata.toolCalls.map((tool) => (
              <ToolCallIndicator key={tool.id} toolCall={tool} />
            ))}
          </div>
        )}
        
        {message.metadata?.citations && message.metadata.citations.length > 0 && (
          <div className="mt-2 pt-2 border-t border-white/20">
            <p className="text-xs opacity-70 mb-1">Sources:</p>
            {message.metadata.citations.map((citation, idx) => (
              <a
                key={idx}
                href={citation.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs opacity-70 hover:opacity-100 underline block"
              >
                {citation.source}
              </a>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function ToolCallIndicator({ toolCall }: { toolCall: any }) {
  return (
    <div className="text-xs opacity-70 flex items-center gap-1">
      <span>🔧</span>
      <span>{toolCall.name}</span>
      {toolCall.status === 'running' && <span className="animate-pulse">...</span>}
    </div>
  );
}

function LoadingIndicator() {
  return (
    <div className="flex items-center gap-2 text-gray-500 dark:text-slate-400">
      <div className="flex gap-1">
        <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
      <span className="text-sm">Thinking...</span>
    </div>
  );
}

function ErrorMessage({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
      <span className="text-sm text-red-600 dark:text-red-400">{error}</span>
      <button
        onClick={onRetry}
        className="p-1 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
        title="Retry"
      >
        <RefreshCw className="w-4 h-4" />
      </button>
    </div>
  );
}

