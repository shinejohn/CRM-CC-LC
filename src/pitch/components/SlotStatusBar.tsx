import { cn } from "@/lib/utils";
import type { SlotStatusLevel } from "../types";

export interface SlotStatusBarProps {
  total: number;
  held: number;
  category: string;
  community: string;
  showLabel?: boolean;
  size?: "sm" | "md";
  /** Shown when status is full, if known */
  heldBy?: string;
  className?: string;
}

function badgeForRemaining(remaining: number): { label: string; level: SlotStatusLevel } {
  if (remaining <= 0) return { label: "FULL", level: "full" };
  if (remaining <= 2) return { label: "ALMOST FULL", level: "almost_full" };
  return { label: "AVAILABLE", level: "open" };
}

function badgeStyle(level: SlotStatusLevel): { background: string; color: string } {
  if (level === "full") return { background: "var(--p-slot-full)", color: "var(--p-text)" };
  if (level === "almost_full")
    return { background: "var(--p-slot-low)", color: "var(--p-bg)" };
  return { background: "var(--p-slot-open)", color: "var(--p-bg)" };
}

export function SlotStatusBar({
  total,
  held,
  category,
  community,
  showLabel = true,
  size = "md",
  heldBy,
  className,
}: SlotStatusBarProps) {
  const remaining = Math.max(0, total - held);
  const { label: badgeLabel, level } = badgeForRemaining(remaining);
  const { background, color } = badgeStyle(level);

  const sq = size === "sm" ? 10 : 14;
  const gap = size === "sm" ? 4 : 6;

  return (
    <div className={cn("space-y-2", className)}>
      {showLabel ? (
        <p
          className="text-xs font-semibold uppercase tracking-wide"
          style={{ color: "var(--p-label)" }}
        >
          {category} — {community}
        </p>
      ) : null}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap items-end" style={{ gap }}>
          {Array.from({ length: total }).map((_, i) => {
            const isHeld = i < held;
            return (
              <div
                key={i}
                className="shrink-0 rounded-[2px]"
                style={{
                  width: sq,
                  height: sq,
                  backgroundColor: isHeld ? "var(--p-teal)" : "transparent",
                  border: `2px solid ${isHeld ? "var(--p-teal)" : "var(--p-slot-track)"}`,
                }}
                aria-hidden
              />
            );
          })}
        </div>
        <div className="flex flex-wrap items-center gap-2 min-w-0">
          <p className="text-[13px] leading-snug" style={{ color: "var(--p-text)" }}>
            {remaining <= 0 && heldBy
              ? `Held by ${heldBy}`
              : `${held} of ${total} held · ${remaining} remaining`}
          </p>
          <span
            className="inline-flex shrink-0 rounded-[var(--p-radius-pill)] px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide"
            style={{ background, color }}
          >
            {badgeLabel}
          </span>
        </div>
      </div>
    </div>
  );
}
