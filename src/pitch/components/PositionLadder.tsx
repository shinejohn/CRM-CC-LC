import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface PositionLadderItem {
  label: string;
  sublabel?: string;
  highlight?: boolean;
  isCurrentPosition?: boolean;
  /** First `basic` item starts the lower tier; a separator is drawn above it. */
  tier?: "premium" | "basic";
}

export interface PositionLadderProps {
  positions: PositionLadderItem[];
  title?: string;
  className?: string;
}

export function PositionLadder({ positions, title, className }: PositionLadderProps) {
  let seenBasic = false;
  const nodes: ReactNode[] = [];

  positions.forEach((pos, index) => {
    const step = index + 1;
    const showSeparator = pos.tier === "basic" && !seenBasic;
    if (pos.tier === "basic") seenBasic = true;

    if (showSeparator) {
      nodes.push(
        <li key={`sep-${index}`} className="my-3 list-none" aria-hidden>
          <div className="h-px w-full" style={{ backgroundColor: "var(--p-border-light)" }} />
          <p
            className="mt-2 text-[11px] font-semibold uppercase tracking-wide"
            style={{ color: "var(--p-label)" }}
          >
            Core listings
          </p>
        </li>
      );
    }

    nodes.push(
      <li
        key={`${pos.label}-${step}`}
        className="flex gap-3 rounded-[var(--p-radius-md)] px-3 py-3"
        style={{
          backgroundColor: pos.highlight ? "var(--p-teal-soft)" : "transparent",
        }}
      >
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold"
          style={{
            backgroundColor: pos.isCurrentPosition ? "var(--p-border)" : "var(--p-card-hover)",
            color: pos.isCurrentPosition ? "var(--p-muted)" : "var(--p-text)",
          }}
          aria-hidden
        >
          {step}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="font-semibold"
              style={{
                color: pos.isCurrentPosition ? "var(--p-muted)" : "var(--p-text)",
              }}
            >
              {pos.label}
            </span>
            {pos.highlight ? (
              <span className="text-xs font-semibold" style={{ color: "var(--p-teal)" }}>
                ← You&apos;d be here
              </span>
            ) : null}
            {pos.isCurrentPosition ? (
              <span className="text-xs font-medium" style={{ color: "var(--p-muted)" }}>
                ← You are here
              </span>
            ) : null}
          </div>
          {pos.sublabel ? (
            <p className="mt-1 text-sm" style={{ color: "var(--p-muted)" }}>
              {pos.sublabel}
            </p>
          ) : null}
        </div>
      </li>
    );
  });

  return (
    <div className={cn("space-y-4", className)}>
      {title ? (
        <h3 className="text-lg font-bold" style={{ color: "var(--p-text)" }}>
          {title}
        </h3>
      ) : null}
      <ol className="m-0 list-none space-y-0 p-0">{nodes}</ol>
    </div>
  );
}
