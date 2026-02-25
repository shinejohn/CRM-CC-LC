import React from 'react';
import { ArrowUpRight, Clock } from 'lucide-react';

export interface ActivityItem {
    id: string;
    type: string;
    title: string;
    subtitle?: string;
    icon?: string;
    color?: string;
    timestamp: string;
    url?: string;
}

export interface ActivityFeedProps {
    items: ActivityItem[];
    title?: string;
    viewAllUrl?: string;
    maxItems?: number;
}

export function ActivityFeed({
    items,
    title = "Recent Activity",
    viewAllUrl,
    maxItems = 5
}: ActivityFeedProps) {
    const displayItems = items.slice(0, maxItems);

    return (
        <div className="flex flex-col space-y-4">
            {title && (
                <div className="flex justify-between items-end mb-2">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 tracking-tight">
                        {title}
                    </h3>
                </div>
            )}

            <div className="space-y-3">
                {displayItems.map((item, index) => (
                    <div
                        key={item.id || index}
                        className={`group flex items-start gap-4 p-4 rounded-xl border border-transparent 
              hover:border-slate-200 dark:hover:border-slate-700 hover:bg-white dark:hover:bg-slate-800 
              transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md
            `}
                        onClick={() => item.url && (window.location.href = item.url)}
                    >
                        {/* Dot Indicator */}
                        <div className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${item.color || 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]'}`} />

                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start gap-2">
                                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 line-clamp-1">
                                    {item.title}
                                </p>
                                <div className="flex items-center gap-1 flex-shrink-0 text-slate-400 dark:text-slate-500 text-xs font-medium">
                                    <Clock className="w-3 h-3" />
                                    {item.timestamp}
                                </div>
                            </div>

                            {item.subtitle && (
                                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                                    {item.subtitle}
                                </p>
                            )}
                        </div>

                        {item.url && (
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <ArrowUpRight className="w-4 h-4 text-slate-400 hover:text-blue-500 transition-colors" />
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {viewAllUrl && items.length > maxItems && (
                <a
                    href={viewAllUrl}
                    className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-right mt-2 flex justify-end"
                >
                    View all activity &rarr;
                </a>
            )}
        </div>
    );
}
