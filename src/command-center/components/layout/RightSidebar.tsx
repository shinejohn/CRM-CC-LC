import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, MessageSquare, CheckSquare, Calendar, Mail, X, Sparkles } from 'lucide-react';
import { getCardStyle } from '../../lib/command-center-theme';

export function RightSidebar({ onClose }: { onClose?: () => void }) {
    const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({
        tasks: true,
    });

    const toggleCard = (id: string) => {
        setExpandedCards(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const widgets = [
        { id: 'tasks', title: 'Tasks', icon: CheckSquare, color: 'mint', items: ['Review Draft #1', 'Call John'] },
        { id: 'messages', title: 'Messages', icon: MessageSquare, color: 'rose', items: ['Alice: "Sounds good!"', 'Bob sent an image'] },
        { id: 'calendar', title: 'Calendar', icon: Calendar, color: 'sky', items: ['Team Sync (2:00 PM)'] },
        { id: 'email', title: 'Email', icon: Mail, color: 'lavender', items: ['New lead received'] },
    ];

    const isDarkMode = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');

    return (
        <motion.div
            initial={{ width: 0, opacity: 0, x: 20 }}
            animate={{ width: 320, opacity: 1, x: 0 }}
            exit={{ width: 0, opacity: 0, x: 20 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="h-full bg-slate-50 dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col z-40 overflow-hidden shadow-xl"
        >
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-800/50">
                <h3 className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-xs">Quick Access</h3>
                {onClose && (
                    <button onClick={onClose} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors">
                        <X className="w-4 h-4 text-slate-500" />
                    </button>
                )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Placeholder AI Chat Box */}
                <div className="rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-5 text-white shadow-lg drop-shadow">
                    <div className="font-bold mb-3 flex items-center gap-2 text-sm tracking-wide">
                        <Sparkles className="w-4 h-4 text-purple-200" /> ACCOUNT MANAGER AI
                    </div>
                    <div className="bg-white/10 border border-white/20 rounded-xl p-4 text-sm min-h-[100px] backdrop-blur-md font-medium">
                        How can I help you manage your zones today?
                    </div>
                </div>

                {widgets.map(widget => {
                    const style = getCardStyle(widget.color, isDarkMode);
                    const isExpanded = expandedCards[widget.id];
                    return (
                        <div key={widget.id} className={`${style.className}`}>
                            <button
                                onClick={() => toggleCard(widget.id)}
                                className={`w-full p-4 flex items-center justify-between flex-1 ${style.headerClass}`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`p-1.5 rounded-lg ${style.iconBg}`}>
                                        <widget.icon className={`w-4 h-4 ${style.iconColor}`} />
                                    </div>
                                    <span className={`font-semibold text-sm ${style.textClass}`}>{widget.title}</span>
                                </div>
                                <ChevronDown className={`w-4 h-4 ${style.textClass} transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                            </button>
                            <AnimatePresence>
                                {isExpanded && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="overflow-hidden"
                                    >
                                        <div className={`p-4 pt-0 space-y-2 ${style.contentBg}`}>
                                            <div className="h-px w-full bg-black/5 dark:bg-white/5 mb-3" />
                                            {widget.items.map((item, i) => (
                                                <div key={i} className={`p-2.5 rounded-lg text-sm font-medium ${style.textClass} ${style.itemHover} transition-colors cursor-pointer border border-transparent hover:border-black/5 dark:hover:border-white/5`}>
                                                    {item}
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    );
                })}
            </div>
        </motion.div>
    );
}
