import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Minimize2, Send, Mic, Paperclip, ChevronRight } from 'lucide-react';
export function AIAssistantWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const toggleOpen = () => setIsOpen(!isOpen);
  return <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && <motion.div initial={{
        opacity: 0,
        scale: 0.9,
        y: 20
      }} animate={{
        opacity: 1,
        scale: 1,
        y: 0
      }} exit={{
        opacity: 0,
        scale: 0.9,
        y: 20
      }} className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-[380px] h-[500px] flex flex-col overflow-hidden mb-4">
            {/* Header */}
            <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-4 flex justify-between items-center text-white">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                <span className="font-bold">AI Assistant</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded-lg transition-colors">
                  <Minimize2 className="w-4 h-4" />
                </button>
                <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded-lg transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="p-4 border-b border-slate-100 bg-slate-50/50">
              <div className="grid grid-cols-2 gap-2">
                {['Send campaign', 'Check schedule', 'See revenue', 'Look up customer', 'Create invoice', 'Get help'].map(action => <button key={action} className="text-xs text-slate-600 bg-white border border-slate-200 rounded-full py-1.5 px-3 hover:border-violet-500 hover:text-violet-600 transition-colors text-left truncate">
                    {action}
                  </button>)}
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
              <div className="flex justify-end">
                <div className="bg-blue-600 text-white rounded-2xl rounded-tr-sm py-2 px-4 max-w-[85%] text-sm shadow-sm">
                  What's my revenue this month?
                </div>
              </div>

              <div className="flex justify-start">
                <div className="bg-white text-slate-700 border border-slate-200 rounded-2xl rounded-tl-sm py-3 px-4 max-w-[90%] text-sm shadow-sm space-y-3">
                  <p>
                    Your revenue this month is{' '}
                    <span className="font-bold text-emerald-600">$12,450</span>,
                    which is 12% higher than last month.
                  </p>
                  <p>
                    You're at 78% of your $16,000 goal with 15 days remaining.
                  </p>

                  <div className="pt-2 border-t border-slate-100">
                    <p className="text-xs text-slate-500 mb-2">
                      Would you like me to:
                    </p>
                    <ul className="space-y-1">
                      {['Show contributing customers', 'Identify opportunities', 'Create push for $3,550'].map(item => <li key={item} className="flex items-center gap-2 text-violet-600 hover:text-violet-800 cursor-pointer text-xs font-medium">
                          <ChevronRight className="w-3 h-3" /> {item}
                        </li>)}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-slate-100">
              <div className="relative">
                <input type="text" placeholder="Ask me anything..." className="w-full pl-4 pr-24 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all text-sm" />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                    <Paperclip className="w-4 h-4" />
                  </button>
                  <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                    <Mic className="w-4 h-4" />
                  </button>
                  <button className="p-1.5 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors shadow-sm">
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>}
      </AnimatePresence>

      <motion.button whileHover={{
      scale: 1.05
    }} whileTap={{
      scale: 0.95
    }} onClick={toggleOpen} className={`w-14 h-14 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/30 flex items-center justify-center relative overflow-hidden ${isOpen ? 'hidden' : 'flex'}`}>
        <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full" />
        <Sparkles className="w-6 h-6 relative z-10" />
      </motion.button>
    </div>;
}