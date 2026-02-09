import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Paperclip, Mic, StopCircle, Sparkles,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { AIMessage } from './AIMessage';
import { ToolCallIndicator } from './ToolCallIndicator';
import { useAI } from '../../hooks/useAI';

export function AIChat() {
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
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
  } = useAI();

  // Get current tool calls from messages
  const currentToolCalls = messages
    .flatMap(m => m.metadata?.toolCalls || [])
    .filter((tc: any) => tc.status === 'running' || tc.status === 'pending');

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const message = input;
    setInput('');
    await sendMessage(message);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const stopGeneration = () => {
    abortStream();
  };

  return (
    <div className="h-full flex flex-col">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {messages.length === 0 ? (
          <div className="flex flex-col h-full">
            <WelcomeScreen onSuggestionClick={setInput} />
            {error && (
              <div className="max-w-2xl mx-auto w-full p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 mt-4 mb-4">
                <p className="text-sm text-red-600 dark:text-red-400 text-center">{error}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4 max-w-4xl mx-auto">
            <AnimatePresence>
              {messages.map((message, index) => (
                <motion.div
                  key={message.id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <AIMessage
                    message={message}
                    onRegenerate={message.role === 'assistant' ? regenerate : undefined}
                    isLast={index === messages.length - 1}
                  />
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Tool Calls in Progress */}
            {currentToolCalls.length > 0 && (
              <div className="space-y-2">
                {currentToolCalls.map((tool) => (
                  <ToolCallIndicator key={tool.id} toolCall={tool} />
                ))}
              </div>
            )}

            {/* Loading indicator */}
            {isLoading && !isStreaming && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 text-gray-500 dark:text-slate-400"
              >
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Thinking...</span>
              </motion.div>
            )}

            {/* Error */}
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="relative flex items-end gap-2">
            <div className="flex-1 relative">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything..."
                className="min-h-[52px] max-h-[200px] pr-24 resize-none"
                rows={1}
                disabled={isLoading}
              />
              <div className="absolute right-2 bottom-2 flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  disabled={isLoading}
                >
                  <Paperclip className="w-4 h-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className={`h-8 w-8 ${isRecording ? 'text-red-500' : ''}`}
                  onClick={() => setIsRecording(!isRecording)}
                  disabled={isLoading}
                >
                  {isRecording ? <StopCircle className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {isStreaming ? (
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={stopGeneration}
                className="bg-red-50 hover:bg-red-100 border-red-200 text-red-600"
                aria-label="Stop generating"
              >
                <StopCircle className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </Button>
            )}
          </div>

          <p className="text-xs text-center text-gray-400 dark:text-slate-500 mt-2">
            AI can make mistakes. Verify important information.
          </p>
        </form>
      </div>
    </div>
  );
}

function WelcomeScreen({ onSuggestionClick }: { onSuggestionClick: (text: string) => void }) {
  const suggestions = [
    "Help me draft an email to a new lead",
    "Analyze my customer engagement this month",
    "Write a social media post about our services",
    "Create a follow-up sequence for cold leads",
  ];

  return (
    <div className="h-full flex flex-col items-center justify-center max-w-2xl mx-auto text-center">
      <div className="p-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mb-6">
        <Sparkles className="w-12 h-12 text-white" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        How can I help you today?
      </h2>
      <p className="text-gray-500 dark:text-slate-400 mb-8">
        I can help with content creation, data analysis, customer outreach, and more.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
        {suggestions.map((suggestion, index) => (
          <motion.button
            key={index}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSuggestionClick(suggestion)}
            className="p-4 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-left hover:shadow-md transition-all"
          >
            <p className="text-sm text-gray-700 dark:text-slate-300">{suggestion}</p>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

