import { motion } from "framer-motion";
import type { FallbackProduct } from "../types";
import { cn } from "@/lib/utils";

export interface SlotFullFallbackProps {
  slotType: "influencer" | "headliner" | "expert_column";
  category?: string;
  community?: string;
  heldBy?: string;
  nearbyOptions?: { communityName: string; available: number }[];
  fallbackProducts: FallbackProduct[];
  onSelectFallback: (product: FallbackProduct) => void;
  onSkip: () => void;
  className?: string;
}

export function SlotFullFallback({
  slotType,
  category = "this category",
  community = "your community",
  heldBy = "another business",
  nearbyOptions = [],
  fallbackProducts,
  onSelectFallback,
  onSkip,
  className,
}: SlotFullFallbackProps) {
  let headline = "";
  if (slotType === "influencer") {
    headline = `Influencer slots in ${category} are full. Section Sponsor is the alternative — no slot limit. Here are the available sections:`;
  } else if (slotType === "headliner") {
    headline = `Headliner held by ${heldBy}. Priority Listing is the next best position — available now.`;
  } else {
    const nearby =
      nearbyOptions.length > 0
        ? nearbyOptions.map((n) => `${n.communityName} (${n.available} open)`).join(", ")
        : "nearby communities";
    headline = `Column held in ${community}. Available in ${nearby}.`;
  }

  return (
    <motion.div
      layout
      className={cn("space-y-4 rounded-[var(--p-radius-lg)] border p-4", className)}
      style={{
        backgroundColor: "var(--p-card)",
        borderColor: "var(--p-border)",
      }}
    >
      <p className="text-sm leading-relaxed" style={{ color: "var(--p-text)" }}>
        {headline}
      </p>

      {slotType === "influencer" || slotType === "expert_column" ? (
        <div className="flex flex-wrap gap-2">
          {fallbackProducts.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => onSelectFallback(p)}
              className="rounded-[var(--p-radius-pill)] border px-3 py-1.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--p-teal)]"
              style={{ borderColor: "var(--p-border-light)", color: "var(--p-text)" }}
              aria-label={`Choose ${p.label}`}
            >
              {p.label}
            </button>
          ))}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fallbackProducts[0] && onSelectFallback(fallbackProducts[0])}
          className="rounded-[var(--p-radius-pill)] px-4 py-2.5 text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--p-teal)]"
          style={{ backgroundColor: "var(--p-teal)", color: "var(--p-bg)" }}
          aria-label="Add Priority Listing"
        >
          Add Priority Listing
        </button>
      )}

      <button
        type="button"
        onClick={onSkip}
        className="text-sm font-medium underline-offset-2 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--p-teal)] rounded"
        style={{ color: "var(--p-muted)" }}
        aria-label="Skip for now"
      >
        Skip for now
      </button>
    </motion.div>
  );
}
