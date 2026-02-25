import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Search, Settings, LogOut, User, Sparkles, Building2, ChevronDown, Maximize2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useNotificationBadge } from '@/hooks/useNotificationBadge';
import { useNavigate } from 'react-router';
import { useAccountManager } from '../../hooks/useAccountManager';

interface CommandCenterHeaderProps {
    businessName?: string;
    onToggleRightSidebar?: () => void;
    onOrderServices?: () => void;
}

export function CommandCenterHeader({ businessName = 'My Business', onToggleRightSidebar, onOrderServices }: CommandCenterHeaderProps) {
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const { unreadCount } = useNotificationBadge();
    const navigate = useNavigate();
    const { toggle, isOpen } = useAccountManager();

    return (
        <header className="h-[76px] bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-white/20 dark:border-slate-800 sticky top-0 z-30 flex items-center justify-between px-8 shadow-sm">
            {/* Left: Logo & Business Name */}
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center font-bold text-xl text-white shadow-lg shadow-blue-500/20">
                    C
                </div>
                <div>
                    <h1 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
                        Command Center
                    </h1>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                        {businessName}
                    </p>
                </div>
            </div>

            {/* Center: Search */}
            <div className="flex-1 max-w-xl mx-8 hidden md:block">
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    <Input
                        type="text"
                        placeholder="Search activities, clients, campaigns..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-11 h-11 bg-slate-100/50 dark:bg-slate-800/50 border-slate-200/50 dark:border-slate-700/50 rounded-full focus:bg-white dark:focus:bg-slate-800 transition-all focus:ring-2 focus:ring-blue-500/20"
                    />
                    <kbd className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-medium text-slate-400 bg-white dark:bg-slate-700 px-2 py-1 rounded shadow-sm border border-slate-200 dark:border-slate-600">
                        ⌘K
                    </kbd>
                </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-5">

                {/* AI Trigger */}
                <Button
                    variant="ghost"
                    size="icon"
                    className={`hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-full w-10 h-10 transition-colors hidden sm:flex ${isOpen ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600' : 'text-slate-600 dark:text-slate-300'}`}
                    onClick={toggle}
                >
                    <Sparkles className="w-5 h-5" />
                </Button>

                {/* Order Services CTA Button */}
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onOrderServices || (() => navigate('/command-center/services'))}
                    className="hidden lg:flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full shadow-md hover:shadow-lg transition-all border border-blue-500/20"
                >
                    <Sparkles className="w-4 h-4" />
                    <span className="font-semibold text-sm">Order Services</span>
                </motion.button>

                <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 hidden lg:block" />

                <Button variant="ghost" size="icon" className="relative hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full w-10 h-10">
                    <Bell className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                    {unreadCount > 0 && (
                        <span className="absolute top-2 right-2 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-rose-500 text-white text-[10px] font-bold rounded-full border-2 border-white dark:border-slate-900">
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                    )}
                </Button>

                {onToggleRightSidebar && (
                    <Button variant="ghost" size="icon" className="hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full w-10 h-10" onClick={onToggleRightSidebar}>
                        <Maximize2 className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                    </Button>
                )}

                <div className="relative">
                    <button
                        onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                        className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full p-1 pr-3 transition-colors border border-transparent hover:border-slate-300 dark:hover:border-slate-600"
                    >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xs font-bold text-white shadow-sm">
                            JD
                        </div>
                        <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${profileMenuOpen ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                        {profileMenuOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                transition={{ duration: 0.15 }}
                                className="absolute right-0 top-full mt-3 w-64 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50"
                            >
                                <div className="p-4 border-b border-slate-100 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/50">
                                    <p className="font-bold text-slate-900 dark:text-white">John Doe</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">admin@business.com</p>
                                </div>
                                <div className="p-2">
                                    <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700/50 text-left transition-colors">
                                        <User className="w-4 h-4 text-slate-500" />
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">My Profile</span>
                                    </button>
                                    <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700/50 text-left transition-colors">
                                        <Building2 className="w-4 h-4 text-slate-500" />
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Business Settings</span>
                                    </button>
                                    <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700/50 text-left transition-colors">
                                        <Settings className="w-4 h-4 text-slate-500" />
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Preferences</span>
                                    </button>
                                </div>
                                <div className="p-2 border-t border-slate-100 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/50">
                                    <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-500/10 text-left transition-colors">
                                        <LogOut className="w-4 h-4 text-rose-500" />
                                        <span className="text-sm font-medium text-rose-600 dark:text-rose-400">Sign Out</span>
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </header>
    );
}
