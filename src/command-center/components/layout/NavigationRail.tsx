import React from 'react';
import { NavLink, useLocation } from 'react-router';
import {
    Command, UserCircle, Target, ShoppingCart,
    Truck, BarChart3, Zap
} from 'lucide-react';

const navItems = [
    { zone: 'dashboard', href: '/command-center/dashboard', label: 'Home', icon: Command, color: 'text-slate-600 dark:text-slate-400', activeBg: 'bg-slate-100 dark:bg-slate-800' },
    { zone: 'define', href: '/command-center/define', label: 'Define', icon: UserCircle, color: 'text-peach-600 dark:text-orange-400', activeBg: 'bg-orange-50 dark:bg-orange-900/20' },
    { zone: 'attract', href: '/command-center/attract', label: 'Attract', icon: Target, color: 'text-sky-600 dark:text-sky-400', activeBg: 'bg-sky-50 dark:bg-sky-900/20' },
    { zone: 'sell', href: '/command-center/sell', label: 'Sell', icon: ShoppingCart, color: 'text-mint-600 dark:text-emerald-400', activeBg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    { zone: 'deliver', href: '/command-center/deliver', label: 'Deliver', icon: Truck, color: 'text-lavender-600 dark:text-purple-400', activeBg: 'bg-purple-50 dark:bg-purple-900/20' },
    { zone: 'measure', href: '/command-center/measure', label: 'Measure', icon: BarChart3, color: 'text-ocean-600 dark:text-cyan-400', activeBg: 'bg-cyan-50 dark:bg-cyan-900/20' },
    { zone: 'automate', href: '/command-center/automate', label: 'Automate', icon: Zap, color: 'text-violet-600 dark:text-indigo-400', activeBg: 'bg-indigo-50 dark:bg-indigo-900/20' },
];

export function NavigationRail({ className }: { className?: string }) {
    const location = useLocation();

    return (
        <nav className={`w-[140px] fixed left-0 top-0 bottom-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-r border-slate-200 dark:border-slate-800 flex flex-col items-center py-6 z-40 shadow-sm ${className || ''}`}>
            <div className="flex-1 w-full px-3 flex flex-col gap-2 pt-[76px] overflow-y-auto no-scrollbar">
                {navItems.map((item) => {
                    const isActive = location.pathname.includes(item.href);
                    return (
                        <NavLink
                            key={item.zone}
                            to={item.href}
                            className={`flex flex-col items-center justify-center p-3.5 rounded-2xl transition-all duration-300 group outline-none focus-visible:ring-2 focus-visible:ring-blue-500
                ${isActive
                                    ? `${item.activeBg} shadow-sm border border-black/5 dark:border-white/5 scale-[1.02]`
                                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-500 hover:scale-105'
                                }
              `}
                        >
                            <div className={`mb-2 p-2 rounded-xl transition-colors duration-300 ${isActive ? 'bg-white shadow-sm dark:bg-slate-800 border border-black/5 dark:border-white/5' : 'bg-transparent'}`}>
                                <item.icon className={`w-6 h-6 transition-transform duration-300 group-hover:-translate-y-0.5 group-active:scale-95
                  ${isActive ? item.color : 'opacity-70 group-hover:opacity-100'}
                `} />
                            </div>
                            <span className={`text-[10px] font-extrabold tracking-widest uppercase
                ${isActive ? item.color : 'opacity-70 group-hover:opacity-100'}
              `}>
                                {item.label}
                            </span>
                        </NavLink>
                    );
                })}
            </div>

            {/* Footer nav items */}
            <div className="w-full px-4 pb-4">
                <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-800 to-transparent mb-4" />
                <a href="/public" target="_blank" className="flex flex-col items-center justify-center p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-500 transition-colors group">
                    <span className="text-[10px] font-extrabold text-center uppercase tracking-widest group-hover:text-blue-500 transition-colors">Public Page</span>
                </a>
            </div>
        </nav>
    );
}
