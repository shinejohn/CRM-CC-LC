import React, { useState, useRef, useEffect } from 'react';
import { Send, X, MessageCircle, Loader2 } from 'lucide-react';
import { aiApi } from '@/services/learning/ai-api';
import type { AIConversationRequest } from '@/services/learning/ai-api';

interface AIChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  presenterName?: string;
  customerId?: string;
  presentationId?: string;
  conversationId?: string;
  onResume?: () => void;
  isPaused?: boolean;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  actions?: Array<{ type: string; data: Record<string, unknown> }>;
}

export const AIChatPanel: React.FC<AIChatPanelProps> = ({
  isOpen,
  onClose,
  presenterName = 'AI Assistant',
  customerId,
  presentationId,
  conversationId,
  onResume,
  isPaused = false,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const request: AIConversationRequest = {
        message: userMessage.content,
        context: {
          customer_id: customerId,
          presentation_id: presentationId,
          conversation_id: conversationId,
        },
      };

      const response = await aiApi.sendMessage(request);

      const aiMessage: Message = {
        id: response.message_id,
        role: 'assistant',
        content: response.response,
        timestamp: new Date(),
        actions: response.suggested_actions,
      };

      setMessages((prev) => [...prev, aiMessage]);

      // Process actions if any
      if (response.suggested_actions && response.suggested_actions.length > 0) {
        try {
          await aiApi.processActions(response.suggested_actions);
          console.log('AI actions processed successfully');
        } catch (error) {
          console.error('Failed to process AI actions:', error);
        }
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-24 right-6 w-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 flex flex-col max-h-[600px]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-indigo-50">
        <div className="flex items-center gap-2">
          <MessageCircle size={20} className="text-indigo-600" />
          <div>
            <h3 className="font-semibold text-gray-900">Chat with {presenterName}</h3>
            <p className="text-xs text-gray-600">Ask questions anytime</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-8 text-gray-500 text-sm">
            <MessageCircle size={32} className="mx-auto mb-2 text-gray-400" />
            <p>Start a conversation with {presenterName}</p>
            <p className="text-xs mt-1">Ask about features, pricing, or how it works</p>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                message.role === 'user'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              {message.actions && message.actions.length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-300">
                  <p className="text-xs font-medium mb-1">Suggested actions:</p>
                  {message.actions.map((action, i) => (
                    <div key={i} className="text-xs opacity-75">
                      {action.type}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg px-4 py-2">
              <Loader2 size={16} className="animate-spin text-gray-600" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        {isPaused && (
          <div className="mb-2 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800">
            Presentation paused. Click resume to continue.
          </div>
        )}
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your question..."
            disabled={loading}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Send size={18} />
            )}
          </button>
        </div>
        {isPaused && onResume && (
          <button
            onClick={onResume}
            className="mt-2 w-full px-3 py-1.5 bg-indigo-600 text-white rounded text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            Resume Presentation
          </button>
        )}
      </div>
    </div>
  );
};

