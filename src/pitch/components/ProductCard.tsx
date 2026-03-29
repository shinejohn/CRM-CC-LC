import { motion } from "framer-motion";
import { SlotStatusBar } from "./SlotStatusBar";
import type { SlotStatus } from "../types";
import { cn } from "@/lib/utils";

export interface ProductCardProps {
  name: string;
  price: string;
  description: string;
  rationale?: string;
  slotStatus?: SlotStatus;
  slotMeta?: { category: string; community: string };
  included?: boolean;
  onAdd: () => void;
  onSkip: () => void;
  onDefer?: () => void;
  onRemove?: () => void;
  isAdded?: boolean;
  isSkipped?: boolean;
  className?: string;
}

export function ProductCard({
  name,
  price,
  description,
  rationale,
  slotStatus,
  slotMeta,
  included,
  onAdd,
  onSkip,
  onDefer,
  onRemove,
  isAdded,
  isSkipped,
  className,
}: ProductCardProps) {
  const showSlotBar = slotStatus && !isSkipped;

  return (
    <motion.article
      layout
      className={cn(
        "relative overflow-hidden rounded-[var(--p-radius-lg)] border p-4",
        className
      )}
      style={{
        backgroundColor: "var(--p-card)",
        borderColor: isAdded ? "var(--p-teal)" : "var(--p-border)",
        borderLeftWidth: isAdded ? 3 : 1,
        borderLeftStyle: "solid",
        borderLeftColor: isAdded ? "var(--p-teal)" : "var(--p-border)",
      }}
      animate={{
        borderColor: isAdded ? "var(--p-teal)" : "var(--p-border)",
      }}
      transition={{ type: "spring", stiffness: 420, damping: 28 }}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h3 className="text-base font-bold" style={{ color: "var(--p-text)" }}>
          {name}
        </h3>
        <div className="shrink-0">
          {included ? (
            <span
              className="inline-flex rounded-[var(--p-radius-pill)] px-3 py-1 text-xs font-bold uppercase tracking-wide"
              style={{ backgroundColor: "var(--p-teal-dim)", color: "var(--p-text)" }}
            >
              Included
            </span>
          ) : (
            <span className="text-base font-bold" style={{ color: "var(--p-teal)" }}>
              {price}
            </span>
          )}
        </div>
      </div>
      <p className="mt-2 text-sm" style={{ color: "var(--p-muted)" }}>
        {description}
      </p>
      {rationale ? (
        <p
          className="mt-3 rounded-[var(--p-radius-sm)] p-3 text-[13px] italic leading-snug"
          style={{
            color: "var(--p-muted)",
            backgroundColor: "var(--p-message-bg)",
          }}
        >
          {rationale}
        </p>
      ) : null}
      {showSlotBar ? (
        <div className="mt-4">
          <SlotStatusBar
            total={slotStatus.total}
            held={slotStatus.held}
            category={slotMeta?.category ?? "Inventory"}
            community={slotMeta?.community ?? "Your area"}
            heldBy={slotStatus.heldBy}
            size="sm"
          />
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        {!isAdded && !isSkipped ? (
          <>
            <button
              type="button"
              onClick={onAdd}
              className="rounded-[var(--p-radius-pill)] px-4 py-2 text-sm font-semibold transition-opacity hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--p-teal)]"
              style={{ backgroundColor: "var(--p-teal)", color: "var(--p-bg)" }}
              aria-label={`Add ${name}`}
            >
              Add this →
            </button>
            <button
              type="button"
              onClick={onSkip}
              className="rounded-[var(--p-radius-pill)] border px-4 py-2 text-sm font-semibold transition-colors hover:bg-[var(--p-card-hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--p-teal)]"
              style={{ borderColor: "var(--p-border-light)", color: "var(--p-text)" }}
              aria-label={`Skip ${name}`}
            >
              Skip
            </button>
            {onDefer ? (
              <button
                type="button"
                onClick={onDefer}
                className="rounded-[var(--p-radius-pill)] px-3 py-2 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--p-teal)]"
                style={{ color: "var(--p-muted)" }}
                aria-label={`Not right now — ${name}`}
              >
                Not right now
              </button>
            ) : null}
          </>
        ) : null}
        {isAdded ? (
          <>
            <span
              className="inline-flex items-center rounded-[var(--p-radius-pill)] px-4 py-2 text-sm font-semibold opacity-90"
              style={{ color: "var(--p-teal)" }}
            >
              ✓ Added
            </span>
            {onRemove ? (
              <button
                type="button"
                onClick={onRemove}
                className="rounded-[var(--p-radius-pill)] px-3 py-2 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--p-teal)]"
                style={{ color: "var(--p-muted)" }}
                aria-label={`Remove ${name}`}
              >
                Remove
              </button>
            ) : null}
          </>
        ) : null}
        {isSkipped ? (
          <>
            <span className="text-sm font-medium" style={{ color: "var(--p-muted)" }}>
              Skipped
            </span>
            <button
              type="button"
              onClick={onAdd}
              className="rounded-[var(--p-radius-pill)] border px-4 py-2 text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--p-teal)]"
              style={{ borderColor: "var(--p-border-light)", color: "var(--p-text)" }}
              aria-label={`Add ${name} instead`}
            >
              Add instead
            </button>
          </>
        ) : null}
      </div>
    </motion.article>
  );
}
