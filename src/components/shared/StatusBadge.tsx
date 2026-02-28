import { cn } from "@/lib/utils";

interface StatusBadgeProps {
    status:
    | "active"
    | "inactive"
    | "pending"
    | "completed"
    | "cancelled"
    | "overdue"
    | "draft"
    | "archived";
    size?: "sm" | "md";
}

const statusStyles = {
    active:
        "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    inactive: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
    pending:
        "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    completed: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    cancelled: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500",
    overdue: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    draft: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
    archived: "bg-gray-50 text-gray-400 dark:bg-gray-900 dark:text-gray-600",
};

export function StatusBadge({ status, size = "sm" }: StatusBadgeProps) {
    return (
        <span
            className={cn(
                "inline-flex items-center justify-center rounded-full font-medium transition-colors",
                size === "sm" ? "px-2.5 py-0.5 text-xs" : "px-3 py-1 text-sm",
                statusStyles[status] || statusStyles.draft
            )}
        >
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
    );
}
