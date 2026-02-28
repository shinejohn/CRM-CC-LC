import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface SearchInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    debounceMs?: number;
    className?: string;
}

export function SearchInput({
    value,
    onChange,
    placeholder = "Search...",
    debounceMs = 300,
    className,
}: SearchInputProps) {
    const [localValue, setLocalValue] = useState(value);

    // Sync incoming value down
    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    // Debounce changes up
    useEffect(() => {
        const handler = setTimeout(() => {
            if (localValue !== value) {
                onChange(localValue);
            }
        }, debounceMs);
        return () => clearTimeout(handler);
    }, [localValue, onChange, debounceMs, value]);

    return (
        <div className={cn("relative", className)}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--nexus-text-tertiary)]" />
            <Input
                value={localValue}
                onChange={(e) => setLocalValue(e.target.value)}
                className="pl-9 h-10 w-full bg-[var(--nexus-input-bg)] border-[var(--nexus-input-border)] text-[var(--nexus-text-primary)] placeholder:text-[var(--nexus-text-tertiary)] transition-colors focus-visible:ring-[var(--nexus-accent-primary)]"
                placeholder={placeholder}
            />
        </div>
    );
}
