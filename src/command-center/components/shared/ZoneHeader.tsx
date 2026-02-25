import React, { ReactNode } from 'react';
import { getCardStyle } from '../../lib/command-center-theme';
import { Sparkles } from 'lucide-react';

export interface ZoneHeaderProps {
    zone: string;
    title?: string;
    subtitle?: string;
    actions?: ReactNode;
    completion?: number; // 0-100 progress
    icon?: React.ReactNode;
}

export function ZoneHeader({
    zone,
    title,
    subtitle,
    actions,
    completion,
    icon
}: ZoneHeaderProps) {
    // Map zones to their color schemes
    const zoneColorMap: Record<string, string> = {
        'DEFINE': 'peach',
        'ATTRACT': 'sky',
        'SELL': 'mint',
        'DELIVER': 'lavender',
        'MEASURE': 'ocean',
        'AUTOMATE': 'violet',
    };

    const isDarkMode = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
    const mappedColor = zoneColorMap[zone.toUpperCase()] || 'sky';
    const style = getCardStyle(mappedColor, isDarkMode);

    const radius = 30;
    const stroke = 5;
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - ((completion || 0) / 100) * circumference;

    return (
        <div className={`relative mb-8 rounded-2xl overflow-hidden glass-panel border border-white/40 dark:border-white/10 shadow-lg drop-shadow bg-gradient-to-r ${style.gradient.replace('to-', 'to-white/10 dark:to-black/10 via-')}`}>
            <div className="px-8 py-6 relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">

                {/* Left side: Icon, Title, Subtitle */}
                <div className="flex items-center gap-5">
                    <div className={`p-4 rounded-xl ${style.iconBg} shadow-sm backdrop-blur-md border border-white/30 dark:border-white/10`}>
                        {icon || <Sparkles className={`w-8 h-8 ${style.iconColor}`} />}
                    </div>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className={`text-4xl font-extrabold tracking-tight ${style.textClass} drop-shadow-sm`}>
                                {title || zone.toUpperCase()}
                            </h1>
                            {completion !== undefined && completion < 100 && (
                                <span className="bg-white/40 dark:bg-black/30 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-sm shadow-sm border border-white/20">
                                    {completion}% Done
                                </span>
                            )}
                        </div>
                        {subtitle && (
                            <p className="text-slate-600 dark:text-slate-300 mt-2 text-lg max-w-2xl font-medium">
                                {subtitle}
                            </p>
                        )}
                    </div>
                </div>

                {/* Right side: Completion Ring & Actions */}
                <div className="flex items-center gap-6">
                    {completion !== undefined && (
                        <div className="flex items-center gap-4 bg-white/30 dark:bg-black/20 p-3 pr-5 rounded-2xl shadow-sm border border-white/20 backdrop-blur-sm">
                            <div className="relative w-16 h-16 flex items-center justify-center">
                                <svg
                                    height={radius * 2}
                                    width={radius * 2}
                                    className="-rotate-90 transform"
                                >
                                    <circle
                                        stroke="currentColor"
                                        fill="transparent"
                                        strokeWidth={stroke}
                                        r={normalizedRadius}
                                        cx={radius}
                                        cy={radius}
                                        className="text-white/40 dark:text-black/20"
                                    />
                                    <circle
                                        stroke="currentColor"
                                        fill="transparent"
                                        strokeWidth={stroke}
                                        strokeDasharray={circumference + ' ' + circumference}
                                        style={{ strokeDashoffset }}
                                        r={normalizedRadius}
                                        cx={radius}
                                        cy={radius}
                                        className={`${style.iconColor} transition-all duration-1000 ease-out`}
                                    />
                                </svg>
                                <div className="absolute flex flex-col items-center justify-center text-center">
                                    <span className={`text-sm font-bold ${style.textClass}`}>
                                        {completion}%
                                    </span>
                                </div>
                            </div>
                            {completion < 100 ? (
                                <div className="text-sm font-medium">
                                    <p className="text-slate-700 dark:text-slate-200">Set up your foundation!</p>
                                    <p className="text-slate-500 dark:text-slate-400 text-xs">Works better complete</p>
                                </div>
                            ) : (
                                <div className="text-sm font-medium">
                                    <p className="text-slate-700 dark:text-slate-200">Zone is Active</p>
                                    <p className="text-emerald-500 dark:text-emerald-400 font-bold text-xs uppercase">All systems go</p>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="flex gap-3">
                        {actions}
                    </div>
                </div>

            </div>
        </div>
    );
}
