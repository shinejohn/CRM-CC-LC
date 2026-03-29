import { useState } from "react";
import type { PitchGateBaseProps } from "../types";
import { GateWrapper } from "../components/GateWrapper";
import { ProductCard } from "../components/ProductCard";
import { SlotStatusBar } from "../components/SlotStatusBar";

export function GoLocalVoicesGate({
  profile,
  slotData,
  entryMode,
  onProductAdd,
  onProductSkip,
  onProductDefer,
  onGateComplete,
  onGateDefer,
  onLogEvent,
}: PitchGateBaseProps) {
  const [unlocked, setUnlocked] = useState(false);

  const expert = slotData.glv_expert_column ?? {
    total: 4,
    held: 4,
    available: 0,
    status: "full" as const,
    heldBy: "Harbor Legal Group",
  };

  const permissionAsk =
    "What you do is different from most businesses — people have to trust you before they hire you. There's a way to build that in " +
    profile.communityName +
    " that isn't advertising. Can I take a minute?";

  const sampleHeadline = `5 things ${profile.communityName} homeowners should know before hiring a contractor`;

  const inner = (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold md:text-3xl" style={{ color: "var(--p-text)" }}>
        Be the {profile.expertiseLabel} {profile.communityName} reads every week.
      </h2>

      <div
        className="rounded-[var(--p-radius-lg)] border p-5"
        style={{ borderColor: "var(--p-border)", backgroundColor: "var(--p-card)" }}
      >
        <p className="text-xs font-bold uppercase tracking-wide" style={{ color: "var(--p-orange)" }}>
          GoLocalVoices
        </p>
        <p className="mt-2 text-sm font-semibold" style={{ color: "var(--p-text)" }}>
          THE {profile.expertiseLabel.toUpperCase()} GUIDE · By {profile.contactFirstName ?? "You"},{" "}
          {profile.businessName}
        </p>
        <div className="my-3 h-px w-full" style={{ backgroundColor: "var(--p-border)" }} />
        <p className="text-sm italic leading-relaxed" style={{ color: "var(--p-muted)" }}>
          &ldquo;{sampleHeadline}&rdquo;
        </p>
        <p className="mt-4 text-xs" style={{ color: "var(--p-label)" }}>
          {profile.businessName} · {profile.category} · {profile.communityName}
        </p>
      </div>

      <ProductCard
        name="Headline Spot"
        price="Included"
        description="Named column, published regularly — visible in GoLocalVoices and cross-posted to the Day.News morning feed."
        included
        onAdd={() => {
          onProductAdd({ product: "GoLocalVoices Headline Spot", price: 0 });
          onLogEvent("product_accepted", { gate: "golocalvoices", product: "headline_spot" });
        }}
        onSkip={() => onProductSkip("headline_spot")}
      />

      <ProductCard
        name="Community Expert"
        price="+$100/mo"
        description={`Category exclusivity. No other ${profile.expertiseLabel} in ${profile.communityName} can hold a Headline Spot while you do.`}
        slotStatus={expert}
        slotMeta={{ category: "Expert column", community: profile.communityName }}
        onAdd={() => onProductAdd({ product: "Community Expert", price: 100 })}
        onSkip={() => onProductSkip("community_expert")}
        onDefer={() => onProductDefer?.("community_expert")}
      />

      <div className="flex flex-wrap gap-2 border-t pt-4" style={{ borderColor: "var(--p-border)" }}>
        <button
          type="button"
          onClick={onGateComplete}
          className="rounded-[var(--p-radius-pill)] px-4 py-2 text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--p-teal)]"
          style={{ backgroundColor: "var(--p-teal)", color: "var(--p-bg)" }}
        >
          Continue →
        </button>
      </div>
    </div>
  );

  return (
    <GateWrapper
      entryMode={entryMode}
      permissionAsk={permissionAsk}
      onYes={() => {
        setUnlocked(true);
        onLogEvent("gate_permission_granted", { gate: "golocalvoices" });
      }}
      onSkip={() => {
        onLogEvent("gate_permission_denied", { gate: "golocalvoices", via: "skip" });
        onGateDefer();
      }}
      onDefer={() => {
        onLogEvent("gate_permission_denied", { gate: "golocalvoices", via: "defer" });
        onGateDefer();
      }}
      isOpen={entryMode === "upsell" || unlocked}
    >
      {inner}
    </GateWrapper>
  );
}
