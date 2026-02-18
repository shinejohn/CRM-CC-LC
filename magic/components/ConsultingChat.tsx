import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Send, Paperclip, Maximize2, Sparkles } from 'lucide-react';

const API_BASE = import.meta.env?.VITE_API_URL || 'http://localhost:8000/api/v1';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
}

export function ConsultingChat({ personalityId }: { personalityId?: string | null }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activePersonalityId, setActivePersonalityId] = useState<string | null>(personalityId ?? null);

  const fetchPersonality = useCallback(async () => {
    if (activePersonalityId) return activePersonalityId;
    try {
      const token = typeof localStorage !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const r = await fetch(`${API_BASE}/personalities`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: 'include',
      });
      const data = await r.json();
      const list = data?.data ?? data ?? [];
      const p = Array.isArray(list) ? list.find((x: { is_active?: boolean }) => x.is_active !== false) ?? list[0] : null;
      if (p?.id) {
        setActivePersonalityId(p.id);
        return p.id;
      }
    } catch {
      /* ignore */
    }
    return null;
  }, [activePersonalityId]);

  const handleSend = async () => {
    const text = inputValue.trim();
    if (!text || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    const pid = personalityId ?? (await fetchPersonality());
    if (!pid) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: 'AI is not configured. Please set up personalities in settings.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setIsLoading(false);
      return;
    }

    try {
      const token = typeof localStorage !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const convCtx = messages.slice(-10).map((m) => ({
        role: m.sender === 'ai' ? 'assistant' : 'user',
        content: m.text,
      }));
      const res = await fetch(`${API_BASE}/personalities/${pid}/generate-response`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: 'include',
        body: JSON.stringify({ message: text, conversation_context: convCtx }),
      });
      const data = await res.json();
      const responseText = data?.data?.response ?? data?.response ?? 'Sorry, I could not get a response.';
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: responseText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: 'Sorry, I could not get a response. Please try again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };
  return <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <h2 className="font-bold text-slate-900">Consulting Chat</h2>
          <span className="text-xs text-slate-500">with Account Manager</span>
        </div>
        <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="p-6 space-y-4 max-h-[400px] overflow-y-auto bg-slate-50/30">
        {messages.map((message, index) => <motion.div key={message.id} initial={{
        opacity: 0,
        y: 10
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: index * 0.1
      }} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] ${message.sender === 'user' ? 'order-2' : 'order-1'}`}>
              {message.sender === 'ai' && <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                    <Sparkles className="w-3 h-3 text-blue-600" />
                  </div>
                  <span className="text-xs font-medium text-slate-600">
                    Account Manager
                  </span>
                </div>}
              <div className={`rounded-2xl p-4 ${message.sender === 'user' ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-white border border-slate-200 rounded-tl-sm shadow-sm'}`}>
                <p className={`text-sm leading-relaxed ${message.sender === 'user' ? 'text-white' : 'text-slate-700'}`}>
                  {message.text}
                </p>
              </div>
              <span className={`text-xs text-slate-400 mt-1 block ${message.sender === 'user' ? 'text-right' : 'text-left'}`}>
                {message.timestamp}
              </span>
            </div>
          </motion.div>)}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-slate-100 bg-white">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input type="text" value={inputValue} onChange={e => setInputValue(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSend()} placeholder="Type your message..." disabled={isLoading} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all pr-12" />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
              <Paperclip className="w-4 h-4" />
            </button>
          </div>
          <button onClick={handleSend} disabled={isLoading || !inputValue.trim()} className="px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed">
            <Send className="w-4 h-4" />
            {isLoading ? '...' : 'Send'}
          </button>
        </div>
      </div>
    </div>;
}