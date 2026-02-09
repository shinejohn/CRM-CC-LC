import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Paperclip, Maximize2, Sparkles } from 'lucide-react';
interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
}
const initialMessages: Message[] = [{
  id: '1',
  sender: 'ai',
  text: "I noticed your email open rates dropped 5% this week. This is likely due to sending on Tuesday instead of Thursday. Would you like me to adjust Sarah's schedule?",
  timestamp: '10:23 AM'
}, {
  id: '2',
  sender: 'user',
  text: 'Yes, please switch to Thursday sends.',
  timestamp: '10:25 AM'
}, {
  id: '3',
  sender: 'ai',
  text: "Done! I've updated Sarah's email schedule to Thursday mornings at 9 AM. I'll monitor the results and report back next week.",
  timestamp: '10:25 AM'
}];
export function ConsultingChat() {
  const [messages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState('');
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
            <input type="text" value={inputValue} onChange={e => setInputValue(e.target.value)} placeholder="Type your message..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all pr-12" />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
              <Paperclip className="w-4 h-4" />
            </button>
          </div>
          <button className="px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2 font-medium">
            <Send className="w-4 h-4" />
            Send
          </button>
        </div>
      </div>
    </div>;
}