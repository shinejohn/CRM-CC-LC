import { useState } from "react";
import type { PitchGateBaseProps } from "../types";
import { GateWrapper } from "../components/GateWrapper";
import { ProductCard } from "../components/ProductCard";
import { SlotStatusBar } from "../components/SlotStatusBar";

export function PerformerGate(props: PitchGateBaseProps) {
  const {
    profile,
    slotData,
    entryMode,
    onProductAdd,
    onProductSkip,
    onProductDefer,
    onGateComplete,
    onGateDefer,
    onLogEvent,
    variant = "standalone",
  } = props;

  const [unlocked, setUnlocked] = useState(false);

  const perfHead = slotData.gec_performer_headliner ?? {
    total: 5,
    held: 0,
    available: 5,
    status: "open" as const,
  };

  const permissionAsk =
    "GoEventCity has a performer directory venues use when booking talent. Want to see how to show up in it?";

  function handleYes() {
    setUnlocked(true);
    onLogEvent("gate_permission_granted", { gate: "performer" });
  }

  const inner = (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold md:text-3xl" style={{ color: "var(--p-text)" }}>
        Venues in {profile.communityName} use this to find performers. Here&apos;s your position
        in it.
      </h2>

      <SlotStatusBar
        total={perfHead.total}
        held={perfHead.held}
        category="Performer headliner"
        community={profile.communityName}
        heldBy={perfHead.heldBy}
      />

      <ProductCard
        name="Performer Headliner"
        price="from $150/mo"
        description="First profile venues see when they search your category."
        slotStatus={perfHead}
        slotMeta={{ category: profile.category, community: profile.communityName }}
        onAdd={() => {
          onProductAdd({ product: "Performer Headliner", price: 175 });
          onLogEvent("product_accepted", { gate: "performer", product: "Performer Headliner" });
        }}
        onSkip={() => {
          onProductSkip("performer_headliner");
          onLogEvent("product_declined", { gate: "performer", product: "performer_headliner" });
        }}
        onDefer={() => {
          onProductDefer?.("performer_headliner");
          onLogEvent("product_deferred", { gate: "performer", product: "performer_headliner" });
        }}
      />

      <ProductCard
        name="Performer Booking System"
        price="$49/mo + commission"
        description="Venues book you directly with availability visible — fewer endless email threads."
        onAdd={() => {
          onProductAdd({ product: "Performer Booking System", price: 49 });
          onLogEvent("product_accepted", { gate: "performer", product: "Performer Booking System" });
        }}
        onSkip={() => {
          onProductSkip("performer_booking");
          onLogEvent("product_declined", { gate: "performer", product: "performer_booking" });
        }}
      />

      <ProductCard
        name="Calendar Subscription"
        price="$19–49/mo"
        description="Fans subscribe once and get notified for every new date you add."
        onAdd={() => {
          onProductAdd({ product: "Performer Calendar Subscription", price: 35 });
          onLogEvent("product_accepted", { gate: "performer", product: "Performer Calendar Subscription" });
        }}
        onSkip={() => {
          onProductSkip("performer_calendar");
          onLogEvent("product_declined", { gate: "performer", product: "performer_calendar" });
        }}
      />

      <div className="flex flex-wrap gap-2 border-t pt-4" style={{ borderColor: "var(--p-border)" }}>
        <button
          type="button"
          onClick={() => {
            onLogEvent("gate_completed", { gate: "performer" });
            onGateComplete();
          }}
          className="rounded-[var(--p-radius-pill)] px-4 py-2 text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--p-teal)]"
          style={{ backgroundColor: "var(--p-teal)", color: "var(--p-bg)" }}
        >
          Continue →
        </button>
      </div>
    </div>
  );

  if (variant === "embedded") {
    return inner;
  }

  return (
    <GateWrapper
      entryMode={entryMode}
      permissionAsk={permissionAsk}
      onYes={handleYes}
      onSkip={() => {
        onLogEvent("gate_permission_denied", { gate: "performer", via: "skip" });
        onGateDefer();
      }}
      onDefer={() => {
        onLogEvent("gate_permission_denied", { gate: "performer", via: "defer" });
        onGateDefer();
      }}
      isOpen={entryMode === "upsell" || unlocked}
    >
      {inner}
    </GateWrapper>
  );
}
