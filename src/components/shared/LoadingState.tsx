import { Skeleton } from "@/components/ui/skeleton";

interface LoadingStateProps {
    variant: "card" | "table" | "list" | "detail" | "metric";
    count?: number;
}

export function LoadingState({ variant, count = 1 }: LoadingStateProps) {
    if (variant === "card") {
        return (
            <div className="space-y-4">
                {Array.from({ length: count }).map((_, i) => (
                    <div key={i} className="space-y-3">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </div>
                ))}
            </div>
        );
    }

    if (variant === "table") {
        return (
            <div className="space-y-4">
                {Array.from({ length: Math.max(count, 5) }).map((_, i) => (
                    <div key={i} className="flex items-center space-x-4">
                        <Skeleton className="h-12 w-full" />
                    </div>
                ))}
            </div>
        );
    }

    if (variant === "list") {
        return (
            <div className="space-y-3">
                {Array.from({ length: count }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2 flex-1">
                            <Skeleton className="h-4 w-1/3" />
                            <Skeleton className="h-3 w-1/4" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (variant === "metric") {
        return <Skeleton className="h-24 w-full rounded-xl" />;
    }

    // detail
    return (
        <div className="space-y-6">
            <Skeleton className="h-8 w-1/3" />
            <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/6" />
            </div>
        </div>
    );
}
