import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { LoadingState } from "./LoadingState";
import { EmptyState } from "./EmptyState";

interface DataCardProps {
    title?: string;
    subtitle?: string;
    icon?: LucideIcon;
    headerAction?: ReactNode;
    children: ReactNode;
    className?: string;
    isLoading?: boolean;
    isEmpty?: boolean;
    emptyMessage?: string;
    noPadding?: boolean;
}

export function DataCard({
    title,
    subtitle,
    icon: Icon,
    headerAction,
    children,
    className,
    isLoading,
    isEmpty,
    emptyMessage,
    noPadding,
}: DataCardProps) {
    return (
        <div
            className={cn(
                "rounded-xl border border-[var(--nexus-card-border)] bg-[var(--nexus-card-bg)]",
                "shadow-[var(--nexus-card-shadow)] hover:shadow-[var(--nexus-card-shadow-hover)]",
                "transition-shadow duration-200",
                className
            )}
        >
            {(title || headerAction) && (
                <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--nexus-divider)]">
                    <div className="flex items-center gap-3">
                        {Icon && (
                            <Icon className="w-5 h-5 text-[var(--nexus-accent-primary)]" />
                        )}
                        <div>
                            <h3 className="text-sm font-semibold text-[var(--nexus-text-primary)]">
                                {title}
                            </h3>
                            {subtitle && (
                                <p className="text-xs text-[var(--nexus-text-tertiary)] mt-0.5">
                                    {subtitle}
                                </p>
                            )}
                        </div>
                    </div>
                    {headerAction}
                </div>
            )}
            <div className={cn(!noPadding && "p-6")}>
                {isLoading ? (
                    <LoadingState variant="card" />
                ) : isEmpty ? (
                    <EmptyState title={emptyMessage || "No data available"} />
                ) : (
                    children
                )}
            </div>
        </div>
    );
}
