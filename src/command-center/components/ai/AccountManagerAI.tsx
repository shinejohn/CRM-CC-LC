import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Mic, Send, Terminal, Loader2, CheckCircle2 } from 'lucide-react';
import { useAccountManager } from '../../hooks/useAccountManager';
import { ServiceUpsellPrompt } from './ServiceUpsellPrompt';

export function AccountManagerAI({ onClose }: { onClose: () => void }) {
    const { messages, sendMessage, activeTasks } = useAccountManager();
    const [input, setInput] = useState('');
    const [isListening, setIsListening] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = () => {
        if (!input.trim()) return;
        sendMessage(input);
        setInput('');
    };

    return (
        <div className="flex h-full w-full max-w-[1400px] mx-auto">
            {/* Left Chat Area */}
            <div className="flex-1 flex flex-col h-full border-r border-slate-200 dark:border-slate-800">

                {/* Header */}
                <div className="h-16 flex items-center justify-between px-8 border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 p-0.5 shadow-md">
                                <div className="w-full h-full bg-white dark:bg-slate-900 rounded-full flex items-center justify-center">
                                    <Sparkles className="w-5 h-5 text-indigo-500" />
                                </div>
                            </div>
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full shadow-sm" />
                        </div>
                        <div>
                            <h2 className="font-bold text-slate-900 dark:text-white tracking-tight">Account Manager AI</h2>
                            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold tracking-widest uppercase">Sarah • Online</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors flex items-center gap-2 text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                        <span className="text-sm font-bold uppercase tracking-wider hidden sm:block">Close AI</span>
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-8 space-y-6" ref={scrollRef}>
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] sm:max-w-[70%] ${msg.role === 'user' ? 'order-1' : 'order-2'}`}>
                                {msg.role === 'assistant' && (
                                    <div className="flex items-center gap-2 mb-2 ml-1">
                                        <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                                        <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">AI Agent Sarah</span>
                                    </div>
                                )}
                                {msg.content === 'UPSELL_TRIGGER' ? (
                                    <ServiceUpsellPrompt />
                                ) : (
                                    <div className={`px-5 py-3.5 rounded-2xl ${msg.role === 'user'
                                            ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-tr-sm shadow-md'
                                            : 'bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 text-slate-800 dark:text-slate-200 rounded-tl-sm shadow-md drop-shadow-sm'
                                        }`}>
                                        {msg.content}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Input */}
                <div className="p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-slate-200 dark:border-slate-800">
                    <div className="relative flex items-center gap-3 max-w-4xl mx-auto">
                        <button
                            onClick={() => setIsListening(!isListening)}
                            className={`p-3.5 rounded-xl transition-colors ${isListening ? 'bg-rose-100 text-rose-600 shadow-inner' : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-500'}`}
                        >
                            <Mic className={`w-5 h-5 ${isListening ? 'animate-pulse' : ''}`} />
                        </button>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Ask Sarah to create a campaign, generate a report, or automate a task..."
                            className="flex-1 bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-700/50 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl px-5 py-3.5 placeholder:text-slate-400 text-slate-900 dark:text-slate-100 font-medium transition-all"
                        />
                        <button
                            onClick={handleSend}
                            disabled={!input.trim()}
                            className="p-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl shadow-md disabled:opacity-50 transition-all hover:scale-105 active:scale-95 disabled:hover:scale-100"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Right Tasks Area */}
            <div className="w-[340px] bg-slate-50/80 dark:bg-slate-900/80 flex flex-col backdrop-blur-sm">
                <div className="h-16 flex items-center px-6 border-b border-slate-200 dark:border-slate-800">
                    <Terminal className="w-5 h-5 text-indigo-500 mr-2" />
                    <h3 className="font-bold text-slate-800 dark:text-slate-200 tracking-tight">Active Ops</h3>
                </div>
                <div className="flex-1 overflow-y-auto p-5 space-y-4 no-scrollbar">
                    {activeTasks.length === 0 ? (
                        <div className="text-center mt-12 p-6 bg-white/50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 border-dashed">
                            <Sparkles className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">All queues clear. Ready for your next command.</p>
                        </div>
                    ) : (
                        activeTasks.map(task => (
                            <div key={task.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-start gap-3 hover:shadow-md transition-shadow">
                                {task.status === 'pending' && <div className="w-5 h-5 rounded-full border-2 border-amber-400 border-t-transparent animate-spin flex-shrink-0 mt-0.5" />}
                                {task.status === 'in-progress' && <Loader2 className="w-5 h-5 text-blue-500 animate-spin flex-shrink-0 mt-0.5" />}
                                {task.status === 'completed' && <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />}
                                <div>
                                    <p className={`font-semibold text-sm ${task.status === 'completed' ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-slate-200'}`}>
                                        {task.title}
                                    </p>
                                    <p className={`text-[10px] uppercase tracking-widest font-bold mt-1.5 ${task.status === 'pending' ? 'text-amber-500' :
                                            task.status === 'in-progress' ? 'text-blue-500' :
                                                'text-emerald-500'
                                        }`}>
                                        {task.status.replace('-', ' ')}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
