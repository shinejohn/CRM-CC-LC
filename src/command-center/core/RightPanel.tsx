import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Mic, Send, Paperclip } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useNavCommander } from '../../hooks/useNavCommander';

interface RightPanelProps {
  isAIMode: boolean;
  onClose: () => void;
}

export function RightPanel({ isAIMode, onClose }: RightPanelProps) {
  const { executeCommand } = useNavCommander();
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([]);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    // 1. Add user message
    setMessages(prev => [...prev, { role: 'user', text: inputValue }]);

    // 2. Check for navigation command
    const navResult = executeCommand(inputValue);

    if (navResult) {
      // If it was a command (success or fail), respond as AI
      setTimeout(() => {
        setMessages(prev => [...prev, { role: 'ai', text: navResult.message }]);
      }, 500);
    } else {
      // Fallback "Chat" response
      setTimeout(() => {
        setMessages(prev => [...prev, { role: 'ai', text: "I'm listening! (This is a simplified AI demo. Try 'Go to CRM' or 'Go to Services')" }]);
      }, 1000);
    }

    setInputValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <motion.aside
      initial={{ x: 320, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 320, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed right-0 top-16 bottom-0 w-80 bg-white dark:bg-slate-800 border-l border-gray-200 dark:border-slate-700 z-30 flex flex-col shadow-xl"
    >
      {/* Panel Header */}
      <div className="h-14 px-4 flex items-center justify-between border-b border-gray-200 dark:border-slate-700">
        <h2 className="font-semibold text-gray-900 dark:text-white">
          {isAIMode ? 'AI Assistant' : 'Quick Actions'}
        </h2>
        <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close panel">
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Panel Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {isAIMode ? <AIAssistantContent messages={messages} /> : <QuickActionsContent />}
      </div>

      {/* AI Input (only in AI mode) */}
      {isAIMode && (
        <div className="p-4 border-t border-gray-200 dark:border-slate-700">
          <div className="relative">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything... or say 'Go to CRM'"
              className="pr-20 bg-gray-50 dark:bg-slate-700"
              aria-label="AI chat input"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-7 w-7" aria-label="Attach file">
                <Paperclip className="w-4 h-4 text-gray-400" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7" aria-label="Voice input">
                <Mic className="w-4 h-4 text-gray-400" />
              </Button>
              <Button onClick={handleSend} size="icon" className="h-7 w-7 bg-purple-500 hover:bg-purple-600" aria-label="Send message">
                <Send className="w-3 h-3 text-white" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </motion.aside>
  );
}

// Updated Content Component to show messages
function AIAssistantContent({ messages }: { messages?: { role: 'user' | 'ai', text: string }[] }) {
  // ... (Keep existing status header)

  return (
    <div className="space-y-4">
      {/* Status */}
      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400">
        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        <span>AI Ready</span>
      </div>

      {/* Message History */}
      {messages && messages.length > 0 ? (
        <div className="space-y-3 mb-6">
          {messages.map((msg, i) => (
            <div key={i} className={`p-3 rounded-lg text-sm ${msg.role === 'user' ? 'bg-indigo-50 ml-8 text-indigo-900' : 'bg-gray-50 mr-8 text-gray-800'}`}>
              {msg.text}
            </div>
          ))}
        </div>
      ) : (
        /* Default suggested state */
        <>
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">
              Suggested Actions
            </h3>
            {['Go to CRM Dashboard', 'Go to Service Store', 'Go to Settings'].map((action) => (
              <button
                key={action}
                // Add click handler to populate input in real implementation
                className="w-full text-left px-3 py-2 text-sm bg-gray-50 dark:bg-slate-700 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors"
              >
                {action}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// Quick Actions Content
function QuickActionsContent() {
  const quickActions = [
    { label: 'New Customer', color: 'bg-blue-500' },
    { label: 'Create Content', color: 'bg-purple-500' },
    { label: 'Send Campaign', color: 'bg-green-500' },
    { label: 'Schedule Call', color: 'bg-orange-500' },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {quickActions.map((action) => (
          <button
            key={action.label}
            className={`${action.color} text-white text-sm font-medium px-4 py-3 rounded-lg hover:opacity-90 transition-opacity`}
            aria-label={action.label}
          >
            {action.label}
          </button>
        ))}
      </div>

      {/* Recent Activity Preview */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">
          Recent Activity
        </h3>
        {/* Activity items will be populated by ActivityFeed component */}
        <p className="text-sm text-gray-400 dark:text-slate-500 italic">
          Loading recent activity...
        </p>
      </div>
    </div>
  );
}

