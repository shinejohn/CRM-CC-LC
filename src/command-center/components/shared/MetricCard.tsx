import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowDownIcon, ArrowUpIcon, MinusIcon, LucideIcon } from 'lucide-react';
import { getCardStyle } from '../../lib/command-center-theme';

export interface MetricCardProps {
    label: string;
    value: string | number;
    subtitle?: string;
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: string;
    icon?: LucideIcon;
    color?: string;
}

export function MetricCard({
    label,
    value,
    subtitle,
    trend,
    trendValue,
    icon: Icon,
    color = 'sky'
}: MetricCardProps) {
    // Simplistic dark mode check for the visual builder. In production, useTheme would be better.
    const isDarkMode = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
    const style = getCardStyle(color, isDarkMode);

    return (
        <Card className={`relative overflow-hidden ${style.className} hover:-translate-y-1 group`}>
            <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                        {label}
                    </p>
                    {Icon && (
                        <div className={`p-2 rounded-lg ${style.iconBg} transition-transform group-hover:scale-110`}>
                            <Icon className={`w-5 h-5 ${style.iconColor}`} />
                        </div>
                    )}
                </div>

                <div className="flex items-baseline gap-2">
                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white">
                        {value}
                    </h3>
                    {trend && trendValue && (
                        <div className={`flex items-center text-sm font-bold ${trend === 'up' ? 'text-emerald-600 dark:text-emerald-400' :
                                trend === 'down' ? 'text-rose-600 dark:text-rose-400' :
                                    'text-slate-500 dark:text-slate-400'
                            }`}>
                            {trend === 'up' && <ArrowUpIcon className="w-4 h-4 mr-1" />}
                            {trend === 'down' && <ArrowDownIcon className="w-4 h-4 mr-1" />}
                            {trend === 'neutral' && <MinusIcon className="w-4 h-4 mr-1" />}
                            {trendValue}
                        </div>
                    )}
                </div>

                {subtitle && (
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                        {subtitle}
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
