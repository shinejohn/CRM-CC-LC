import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SendIcon, ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
import { simulateApiDelay } from '../utils/mockApi';

interface Message {
  sender: string;
  text: string;
  isAI: boolean;
}
interface ChatPanelProps {
  messages: Message[];
  addMessage: (message: Message) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}
export function ChatPanel({
  messages,
  addMessage,
  isCollapsed,
  onToggleCollapse
}: ChatPanelProps) {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  const handleSendMessage = () => {
    if (newMessage.trim()) {
      addMessage({
        sender: 'You',
        text: newMessage,
        isAI: false
      });
      // Simulate AI response
      simulateApiDelay(1000).then(() => {
        addMessage({
          sender: 'AI Facilitator',
          text: `I understand your message about "${newMessage}". How can I help further?`,
          isAI: true
        });
      });
      setNewMessage('');
    }
  };
  return <motion.div initial={false} animate={{
    height: isCollapsed ? 48 : '100%'
  }} transition={{
    duration: 0.3,
    ease: 'easeInOut'
  }} className="flex flex-col bg-white border-t border-slate-200 shadow-lg">
      {/* Header */}
      <motion.div whileHover={{
      backgroundColor: 'rgb(248, 250, 252)'
    }} className="p-3 bg-slate-50 border-b border-slate-200 font-medium flex items-center justify-between cursor-pointer" onClick={onToggleCollapse}>
        <span className="text-sm font-semibold text-slate-700">Chat</span>
        <motion.button whileHover={{
        scale: 1.1
      }} whileTap={{
        scale: 0.9
      }} className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors">
          {isCollapsed ? <ChevronUpIcon size={18} className="text-slate-600" /> : <ChevronDownIcon size={18} className="text-slate-600" />}
        </motion.button>
      </motion.div>

      <AnimatePresence>
        {!isCollapsed && <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} exit={{
        opacity: 0
      }} transition={{
        duration: 0.2
      }} className="flex flex-col flex-1 min-h-0">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
              <AnimatePresence initial={false}>
                {messages.map((message, index) => <motion.div key={index} initial={{
              opacity: 0,
              y: 10,
              scale: 0.95
            }} animate={{
              opacity: 1,
              y: 0,
              scale: 1
            }} transition={{
              duration: 0.2,
              ease: 'easeOut'
            }} className={`flex ${message.isAI ? 'justify-start' : 'justify-end'}`}>
                    <div className={`max-w-[80%] rounded-xl px-4 py-2.5 shadow-sm ${message.isAI ? 'bg-white border border-slate-200 text-slate-800' : 'bg-blue-600 text-white'}`}>
                      <p className="text-xs font-semibold mb-1 opacity-75">
                        {message.sender}
                      </p>
                      <p className="text-sm leading-relaxed">{message.text}</p>
                    </div>
                  </motion.div>)}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-slate-200 bg-white">
              <div className="flex items-center gap-2">
                <input type="text" className="flex-1 border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" placeholder="Type a message..." value={newMessage} onChange={e => setNewMessage(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSendMessage()} />
                <motion.button whileHover={{
              scale: 1.05
            }} whileTap={{
              scale: 0.95
            }} className="bg-blue-600 text-white p-2.5 rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed" onClick={handleSendMessage} disabled={!newMessage.trim()}>
                  <SendIcon size={18} />
                </motion.button>
              </div>
            </div>
          </motion.div>}
      </AnimatePresence>
    </motion.div>;
}