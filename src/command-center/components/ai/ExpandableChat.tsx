import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Send, ChevronDown, ChevronUp } from 'lucide-react';
import { useAccountManager } from '../../hooks/useAccountManager';

export interface ExpandableChatProps {
    zone: string;
    context?: string;
    className?: string;
    defaultExpanded?: boolean;
}

export function ExpandableChat({ zone, context, className = '', defaultExpanded = false }: ExpandableChatProps) {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);
    const { messages, sendMessage } = useAccountManager();
    const [input, setInput] = useState('');

    const handleSend = () => {
        if (!input.trim()) return;
        sendMessage(input, zone);
        setInput('');
    };

    return (
        <div className={`fixed bottom-6 right-6 w-[340px] z-50 transition-all duration-300 ${className} ${isExpanded ? 'h-[500px] shadow-2xl' : 'h-14 shadow-lg hover:shadow-xl'}`}>
            <div className={`w-full h-full flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 overflow-hidden transition-all duration-300 ${isExpanded ? 'rounded-2xl' : 'rounded-full cursor-pointer group'}`}>

                {/* Header Toggle */}
                <div
                    onClick={() => setIsExpanded(!isExpanded)}
                    className={`flex items-center justify-between w-full px-5 transition-colors ${isExpanded ? 'h-14 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 cursor-pointer' : 'h-14 bg-gradient-to-r from-indigo-500 to-purple-600'}`}
                >
                    <div className="flex items-center gap-3">
                        <div className={`p-1.5 rounded-full transition-colors ${isExpanded ? 'bg-indigo-100 dark:bg-indigo-900/50' : 'bg-white/20 backdrop-blur-sm group-hover:bg-white/30'}`}>
                            <Sparkles className={`w-4 h-4 ${isExpanded ? 'text-indigo-600 dark:text-indigo-400' : 'text-white'}`} />
                        </div>
                        <span className={`font-bold text-sm tracking-wide ${isExpanded ? 'text-slate-800 dark:text-slate-200' : 'text-white'}`}>
                            Ask Sarah
                        </span>
                    </div>
                    {isExpanded ? (
                        <ChevronDown className="w-5 h-5 text-slate-500" />
                    ) : (
                        <ChevronUp className="w-5 h-5 text-white/80 transition-transform group-hover:-translate-y-0.5" />
                    )}
                </div>

                {/* Chat Body */}
                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex-1 flex flex-col h-[calc(100%-112px)] relative"
                        >
                            {/* Messages List */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {messages.map((msg, i) => (
                                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`px-4 py-2.5 rounded-2xl text-sm shadow-sm max-w-[85%] leading-relaxed ${msg.role === 'user'
                                                ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-tr-sm'
                                                : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-sm border border-slate-200 dark:border-slate-700'
                                            }`}>
                                            {msg.content === 'UPSELL_TRIGGER' ? 'Special feature available in the main Command Center!' : msg.content}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Input */}
                            <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                                <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-xl p-1 pr-1.5 focus-within:ring-2 focus-within:ring-indigo-500/30 transition-shadow">
                                    <input
                                        type="text"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                        placeholder="How can I help..."
                                        className="flex-1 bg-transparent border-none text-sm px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-0 placeholder:text-slate-400"
                                    />
                                    <button
                                        onClick={handleSend}
                                        disabled={!input.trim()}
                                        className="p-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg disabled:opacity-50 transition-colors shadow-sm"
                                    >
                                        <Send className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
