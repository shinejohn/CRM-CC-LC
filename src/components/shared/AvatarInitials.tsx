import { cn, getInitials, getColorFromString } from "@/lib/utils";

interface AvatarInitialsProps {
    name: string;
    size?: "sm" | "md" | "lg";
    color?: string;
    className?: string;
}

const sizeMap = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
};

export function AvatarInitials({
    name,
    size = "md",
    color,
    className,
}: AvatarInitialsProps) {
    const bgColor = color || getColorFromString(name);
    const initials = getInitials(name);

    return (
        <div
            className={cn(
                "flex items-center justify-center rounded-full text-white font-medium shrink-0",
                sizeMap[size],
                bgColor,
                className
            )}
        >
            {initials}
        </div>
    );
}
