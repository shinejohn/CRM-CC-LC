import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { LoadingState } from "./LoadingState";

export interface MetricCardProps {
    label: string;
    value: string | number;
    change?: { value: number; direction: "up" | "down" | "flat" };
    icon?: LucideIcon;
    color?: "blue" | "green" | "amber" | "red" | "purple";
    trend?: number[];
    isLoading?: boolean;
}

const colorMap = {
    blue: { bg: "bg-blue-500", text: "text-blue-500", lightBg: "bg-blue-50" },
    green: { bg: "bg-emerald-500", text: "text-emerald-500", lightBg: "bg-emerald-50" },
    amber: { bg: "bg-amber-500", text: "text-amber-500", lightBg: "bg-amber-50" },
    red: { bg: "bg-red-500", text: "text-red-500", lightBg: "bg-red-50" },
    purple: { bg: "bg-purple-500", text: "text-purple-500", lightBg: "bg-purple-50" },
};

export function MetricCard({
    label,
    value,
    change,
    icon: Icon,
    color = "blue",
    trend,
    isLoading,
}: MetricCardProps) {
    if (isLoading) return <LoadingState variant="metric" />;

    const theme = colorMap[color];

    return (
        <div className="relative overflow-hidden rounded-xl border border-[var(--nexus-card-border)] bg-[var(--nexus-card-bg)] p-6 shadow-[var(--nexus-card-shadow)] hover:shadow-[var(--nexus-card-shadow-hover)] transition-shadow">
            {/* Edge accent bar */}
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${theme.bg}`} />

            <div className="flex justify-between items-start">
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        {Icon && <Icon className={`w-4 h-4 ${theme.text}`} />}
                        <h4 className="text-sm font-medium text-[var(--nexus-text-secondary)]">
                            {label}
                        </h4>
                    </div>
                    <div className="text-2xl font-bold text-[var(--nexus-text-primary)]">
                        {value}
                    </div>
                </div>

                {/* Optional sparkline space reserved here */}
                {trend && trend.length > 0 && (
                    <div className="h-10 w-24">
                        {/* Sparkline integration */}
                    </div>
                )}
            </div>

            {change && (
                <div className="mt-4 flex items-center gap-1.5 text-xs font-medium">
                    {change.direction === "up" && (
                        <span className="text-emerald-500">▲</span>
                    )}
                    {change.direction === "down" && (
                        <span className="text-red-500">▼</span>
                    )}
                    {change.direction === "flat" && (
                        <span className="text-gray-400">—</span>
                    )}
                    <span
                        className={cn(
                            change.direction === "up" && "text-emerald-600 dark:text-emerald-400",
                            change.direction === "down" && "text-red-600 dark:text-red-400",
                            change.direction === "flat" && "text-[var(--nexus-text-secondary)]"
                        )}
                    >
                        {Math.abs(change.value)}%
                    </span>
                    <span className="text-[var(--nexus-text-tertiary)] font-normal">
                        vs last period
                    </span>
                </div>
            )}
        </div>
    );
}
