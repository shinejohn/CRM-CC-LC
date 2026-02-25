import React from 'react';
import { Target, TrendingUp, CheckCircle, Zap } from 'lucide-react';

export function ServiceUpsellPrompt() {
    return (
        <div className="w-[450px] bg-white dark:bg-slate-800 border-2 border-indigo-500/30 dark:border-indigo-500/20 rounded-2xl shadow-xl hover:shadow-2xl transition-all overflow-hidden relative group">
            {/* Glow effect on hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-purple-500/10 to-pink-500/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

            <div className="bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-600 p-5 text-white relative overflow-hidden">
                {/* Decorative background shapes */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-black/10 rounded-full blur-2xl" />

                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-3">
                        <div className="bg-white/20 backdrop-blur-sm rounded-lg border border-white/30 px-2.5 py-1 text-[10px] font-bold tracking-widest uppercase flex items-center gap-1.5 shadow-sm">
                            <TrendingUp className="w-3.5 h-3.5" /> Upsell Opportunity
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-xs font-semibold text-indigo-100 line-through opacity-70 mb-0.5">$350/mo</span>
                            <span className="text-base font-extrabold text-white bg-black/20 px-2 py-0.5 rounded-md backdrop-blur-sm">+ $299/mo</span>
                        </div>
                    </div>
                    <h3 className="text-xl font-extrabold tracking-tight drop-shadow-sm mb-1">Local SEO Dominance Pack</h3>
                    <p className="text-indigo-100 text-sm font-medium">Capture the #1 spot in your zip code.</p>
                </div>
            </div>

            <div className="p-6 space-y-5 relative z-10 bg-white dark:bg-slate-800">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300 leading-relaxed">
                    Sarah noticed your business hasn't claimed several key local directories. Our Local SEO pack handles this automatically and guarantees top 3 placement in local maps within 60 days.
                </p>

                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800 shadow-inner">
                    <ul className="space-y-3.5">
                        {[
                            'Google Business Profile Optimization',
                            'Apple Maps & Yelp Claiming',
                            'Weekly Local Post Updates',
                            'Review Request Automation'
                        ].map((benefit, i) => (
                            <li key={i} className="flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5 drop-shadow-[0_2px_4px_rgba(16,185,129,0.3)]" />
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{benefit}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="flex items-center gap-4 bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800/50">
                    <div className="relative">
                        <div className="absolute inset-0 bg-indigo-400 blur-md opacity-20" />
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-100 to-white dark:from-indigo-900 dark:to-slate-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-extrabold text-2xl shadow-sm border border-indigo-200 dark:border-indigo-700 relative z-10">
                            94
                        </div>
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-extrabold text-indigo-900 dark:text-indigo-100 mb-0.5">AI Fit Score: Optimal</p>
                        <p className="text-xs font-medium text-indigo-700/80 dark:text-indigo-300/80 leading-snug">Based on competitor analysis in your exact service radius.</p>
                    </div>
                </div>

                <div className="flex gap-3 pt-2">
                    <button className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-3 px-4 rounded-xl shadow-md hover:shadow-lg hover:from-indigo-500 hover:to-purple-500 hover:-translate-y-0.5 transition-all text-sm">
                        <Zap className="w-4 h-4" fill="currentColor" /> Upgrade Instantly
                    </button>
                    <button className="px-5 text-slate-500 font-bold hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors rounded-xl text-sm">
                        Not Now
                    </button>
                </div>
            </div>
        </div>
    );
}
