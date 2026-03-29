import type { FastPathGateItem } from "../types";
import { cn } from "@/lib/utils";

export interface FastPathNavProps {
  availableGates: FastPathGateItem[];
  onSelect: (gateKey: string) => void;
  onCollapse: () => void;
  className?: string;
}

export function FastPathNav({ availableGates, onSelect, onCollapse, className }: FastPathNavProps) {
  return (
    <div
      className={cn(
        "flex min-h-10 flex-wrap items-center gap-x-3 gap-y-2 border-b px-2 py-2 md:flex-nowrap md:justify-between",
        className
      )}
      style={{
        borderColor: "var(--p-border)",
        backgroundColor: "var(--p-header-bg)",
      }}
    >
      <div className="flex flex-wrap items-center gap-2 md:min-w-0 md:flex-1">
        <span className="text-xs font-medium shrink-0" style={{ color: "var(--p-muted)" }}>
          I already know what I want:
        </span>
        <div className="flex flex-wrap gap-2 md:flex-nowrap md:overflow-x-auto">
          {availableGates.map((g) => (
            <button
              key={g.key}
              type="button"
              onClick={() => onSelect(g.key)}
              className="inline-flex items-center gap-1.5 rounded-[var(--p-radius-pill)] border border-[var(--p-border-light)] px-2.5 py-1 text-xs font-semibold text-[var(--p-text)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--p-teal)] hover:border-[var(--p-teal)] hover:bg-[var(--p-teal)] hover:text-[var(--p-bg)]"
              aria-label={`Go to ${g.label}`}
            >
              <span aria-hidden>{g.icon}</span>
              {g.label}
            </button>
          ))}
        </div>
      </div>
      <button
        type="button"
        onClick={onCollapse}
        className="text-xs font-semibold underline-offset-2 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--p-teal)] rounded shrink-0"
        style={{ color: "var(--p-muted)" }}
        aria-label="Hide fast path navigation"
      >
        ↑ Hide
      </button>
    </div>
  );
}
