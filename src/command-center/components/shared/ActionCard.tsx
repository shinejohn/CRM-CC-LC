import React, { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import { getCardStyle } from '../../lib/command-center-theme';
import { Card, CardContent } from '@/components/ui/card';

export interface ActionCardProps {
    title: string;
    description: string;
    icon: LucideIcon;
    color: string;
    onClick: () => void;
    badge?: string;
    stats?: { label: string; value: string }[];
    disabled?: boolean;
    comingSoon?: boolean;
}

export function ActionCard({
    title,
    description,
    icon: Icon,
    color,
    onClick,
    badge,
    stats,
    disabled,
    comingSoon
}: ActionCardProps) {
    const isDarkMode = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
    const style = getCardStyle(color, isDarkMode);

    return (
        <Card
            onClick={disabled || comingSoon ? undefined : onClick}
            className={`relative overflow-hidden ${style.className} 
        ${disabled || comingSoon ? 'opacity-75 cursor-not-allowed filter grayscale-[0.3]' : 'hover:-translate-y-1 hover:shadow-xl hover:scale-[1.01] active:scale-[0.99]'} 
        transition-all duration-300 group`}
        >
            <CardContent className="p-0 h-full flex flex-col">
                {/* Dynamic Header */}
                <div className={style.headerClass}>
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${style.iconBg} transition-transform group-hover:rotate-3`}>
                            <Icon className={`w-6 h-6 ${style.iconColor}`} />
                        </div>
                        <h3 className={`font-bold text-lg ${style.textClass}`}>
                            {title}
                        </h3>
                    </div>
                    {(badge || comingSoon) && (
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${comingSoon
                                ? 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                                : `${style.iconBg} ${style.iconColor}`
                            }`}>
                            {comingSoon ? 'Coming Soon' : badge}
                        </span>
                    )}
                </div>

                {/* Content Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                        {description}
                    </p>

                    {stats && stats.length > 0 && (
                        <div className={`grid grid-cols-${stats.length} gap-2 p-3 rounded-lg border border-white/20 ${style.contentBg}`}>
                            {stats.map((stat, i) => (
                                <div key={i} className="text-center">
                                    <p className={`text-xs uppercase font-semibold opacity-70 ${style.textClass}`}>
                                        {stat.label}
                                    </p>
                                    <p className={`text-lg font-bold ${style.textClass}`}>
                                        {stat.value}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
