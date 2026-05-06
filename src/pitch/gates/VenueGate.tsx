import { useState } from "react";
import type { PitchGateBaseProps } from "../types";
import { GateWrapper } from "../components/GateWrapper";
import { ProductCard } from "../components/ProductCard";
import { SlotStatusBar } from "../components/SlotStatusBar";

export function VenueGate(props: PitchGateBaseProps) {
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

  const venueHead = slotData.gec_venue_headliner ?? {
    total: 3,
    held: 0,
    available: 3,
    status: "open" as const,
  };

  const permissionAsk =
    "Your space is something people can rent — parties, corporate events, private functions. There's a venue directory where people search specifically for a place to host. Can I show you how that works?";

  function handleYes() {
    setUnlocked(true);
    onLogEvent("gate_permission_granted", { gate: "venue" });
  }

  const inner = (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold md:text-3xl" style={{ color: "var(--p-text)" }}>
        When someone in {profile.communityName} needs a venue, here&apos;s where they look.
      </h2>

      <SlotStatusBar
        total={venueHead.total}
        held={venueHead.held}
        category="Venue headliner"
        community={profile.communityName}
        heldBy={venueHead.heldBy}
      />

      <ProductCard
        name="Venue Headliner"
        price="from $150/mo"
        description="First result when someone in your community searches for a venue to book."
        slotStatus={venueHead}
        slotMeta={{ category: profile.category, community: profile.communityName }}
        onAdd={() => {
          onProductAdd({ product: "Venue Headliner", price: 200 });
          onLogEvent("product_accepted", { gate: "venue", product: "Venue Headliner" });
        }}
        onSkip={() => {
          onProductSkip("venue_headliner");
          onLogEvent("product_declined", { gate: "venue", product: "venue_headliner" });
        }}
        onDefer={() => {
          onProductDefer?.("venue_headliner");
          onLogEvent("product_deferred", { gate: "venue", product: "venue_headliner" });
        }}
      />

      <ProductCard
        name="Venue Booking System"
        price="$49/mo + commission"
        description="Inquiries handled online — check availability, pick a date, deposit. No phone tag, no missed leads after hours."
        onAdd={() => {
          onProductAdd({ product: "Venue Booking System", price: 49 });
          onLogEvent("product_accepted", { gate: "venue", product: "Venue Booking System" });
        }}
        onSkip={() => {
          onProductSkip("venue_booking");
          onLogEvent("product_declined", { gate: "venue", product: "venue_booking" });
        }}
      />

      <div className="flex flex-wrap gap-2 border-t pt-4" style={{ borderColor: "var(--p-border)" }}>
        <button
          type="button"
          onClick={() => {
            onLogEvent("gate_completed", { gate: "venue" });
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
        onLogEvent("gate_permission_denied", { gate: "venue", via: "skip" });
        onGateDefer();
      }}
      onDefer={() => {
        onLogEvent("gate_permission_denied", { gate: "venue", via: "defer" });
        onGateDefer();
      }}
      isOpen={entryMode === "upsell" || unlocked}
    >
      {inner}
    </GateWrapper>
  );
}
