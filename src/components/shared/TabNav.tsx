import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface TabNavProps {
    tabs: { id: string; label: string; icon?: LucideIcon; count?: number }[];
    activeTab: string;
    onTabChange: (tabId: string) => void;
}

export function TabNav({ tabs, activeTab, onTabChange }: TabNavProps) {
    return (
        <div className="border-b border-[var(--nexus-divider)] overflow-x-auto no-scrollbar">
            <nav className="flex space-x-6 px-1" aria-label="Tabs">
                {tabs.map((tab) => {
                    const isActive = tab.id === activeTab;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className={cn(
                                "group inline-flex items-center gap-2 border-b-2 py-4 px-1 text-sm font-medium transition-colors whitespace-nowrap",
                                isActive
                                    ? "border-[var(--nexus-accent-primary)] text-[var(--nexus-accent-primary)]"
                                    : "border-transparent text-[var(--nexus-text-secondary)] hover:border-[var(--nexus-card-border)] hover:text-[var(--nexus-text-primary)]"
                            )}
                        >
                            {tab.icon && (
                                <tab.icon
                                    className={cn(
                                        "h-4 w-4",
                                        isActive
                                            ? "text-[var(--nexus-accent-primary)]"
                                            : "text-[var(--nexus-text-tertiary)] group-hover:text-[var(--nexus-text-secondary)]"
                                    )}
                                />
                            )}
                            {tab.label}
                            {tab.count !== undefined && (
                                <span
                                    className={cn(
                                        "ml-2 rounded-full px-2.5 py-0.5 text-xs",
                                        isActive
                                            ? "bg-[var(--nexus-accent-primary)] text-white"
                                            : "bg-[var(--nexus-bg-secondary)] text-[var(--nexus-text-primary)] group-hover:bg-[var(--nexus-card-border)]"
                                    )}
                                >
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    );
                })}
            </nav>
        </div>
    );
}
