import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
    icon?: LucideIcon;
    title: string;
    description?: string;
    action?: { label: string; onClick: () => void };
}

export function EmptyState({
    icon: Icon,
    title,
    description,
    action,
}: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center p-8 text-center bg-transparent">
            {Icon && (
                <div className="w-12 h-12 rounded-full bg-[var(--nexus-bg-secondary)] flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-[var(--nexus-text-tertiary)]" />
                </div>
            )}
            <h3 className="text-sm font-semibold text-[var(--nexus-text-primary)]">
                {title}
            </h3>
            {description && (
                <p className="text-sm text-[var(--nexus-text-tertiary)] mt-1 max-w-sm">
                    {description}
                </p>
            )}
            {action && (
                <div className="mt-6">
                    <Button onClick={action.onClick}>{action.label}</Button>
                </div>
            )}
        </div>
    );
}
