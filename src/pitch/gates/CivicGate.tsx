import { useState } from "react";
import type { OrgType, PitchGateBaseProps } from "../types";
import { GateWrapper } from "../components/GateWrapper";
import { ProductCard } from "../components/ProductCard";

function civicTypeLabel(org: OrgType): { noun: string; permissionNoun: string } {
  switch (org) {
    case "school":
      return { noun: "school", permissionNoun: "schools" };
    case "nonprofit":
      return { noun: "non-profit", permissionNoun: "non-profits" };
    case "government":
      return { noun: "municipal office", permissionNoun: "municipal partners" };
    default:
      return { noun: "organization", permissionNoun: "organizations" };
  }
}

export function CivicGate({ profile, entryMode, onProductAdd, onProductSkip, onGateComplete, onGateDefer, onLogEvent }: PitchGateBaseProps) {
  const [unlocked, setUnlocked] = useState(false);
  const { noun, permissionNoun } = civicTypeLabel(profile.orgType);

  const orgName = profile.businessName;
  const permissionAsk = `${orgName} serves the community differently than a business. We built something specifically for organizations like yours — not advertising, community communication. Can I show you how other ${permissionNoun} in ${profile.county || "the area"} are using it?`;

  function handleYes() {
    setUnlocked(true);
    onLogEvent("gate_permission_granted", { gate: "civic" });
  }

  const inner = (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold md:text-3xl" style={{ color: "var(--p-text)" }}>
        Your community presence is included. Here&apos;s how to make it work for you.
      </h2>

      <div
        className="rounded-[var(--p-radius-lg)] border p-5"
        style={{ borderColor: "var(--p-border)", backgroundColor: "var(--p-card)" }}
      >
        <ul className="space-y-3 text-sm" style={{ color: "var(--p-text)" }}>
          {[
            "Directory listing on all platforms",
            "Event calendar access — events appear in GoEventCity",
            "Announcements — published to the community feed",
            "Cross-post to Day.News — major events reach the full subscriber base",
          ].map((line) => (
            <li key={line} className="flex gap-2">
              <span style={{ color: "var(--p-green)" }} aria-hidden>
                ✓
              </span>
              {line}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs" style={{ color: "var(--p-muted)" }}>
          Included at no cost for {noun}s in {profile.communityName}.
        </p>
      </div>

      <ProductCard
        name="Premium Event Listing"
        price="$29–99/event"
        description="For major events — priority positioning keeps the listing visible on a busy calendar."
        onAdd={() => {
          onProductAdd({ product: "Premium Event Listing", price: 49 });
          onLogEvent("product_accepted", { gate: "civic", product: "Premium Event Listing" });
        }}
        onSkip={() => {
          onProductSkip("premium_event_listing");
          onLogEvent("product_declined", { gate: "civic", product: "premium_event_listing" });
        }}
      />

      <ProductCard
        name="Event Headliner"
        price="Annual flagship events"
        description="For your biggest event of the year. First card in the calendar for everyone looking at that date."
        onAdd={() => {
          onProductAdd({ product: "Civic Event Headliner", price: 150 });
          onLogEvent("product_accepted", { gate: "civic", product: "Civic Event Headliner" });
        }}
        onSkip={() => {
          onProductSkip("civic_event_headliner");
          onLogEvent("product_declined", { gate: "civic", product: "civic_event_headliner" });
        }}
      />

      <ProductCard
        name="GoLocalVoices Column"
        price="from $100/mo"
        description="If your superintendent, director, or elected official wants to speak to residents directly and regularly, this is the right venue."
        onAdd={() => {
          onProductAdd({ product: "GoLocalVoices Column (Civic)", price: 150 });
          onLogEvent("product_accepted", { gate: "civic", product: "GoLocalVoices Column (Civic)" });
        }}
        onSkip={() => {
          onProductSkip("civic_glv_column");
          onLogEvent("product_declined", { gate: "civic", product: "civic_glv_column" });
        }}
      />

      <div className="flex flex-wrap gap-2 border-t pt-4" style={{ borderColor: "var(--p-border)" }}>
        <button
          type="button"
          onClick={() => {
            onLogEvent("gate_completed", { gate: "civic" });
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

  return (
    <GateWrapper
      entryMode={entryMode}
      permissionAsk={permissionAsk}
      onYes={handleYes}
      onSkip={() => {
        onLogEvent("gate_permission_denied", { gate: "civic", via: "skip" });
        onGateDefer();
      }}
      onDefer={() => {
        onLogEvent("gate_permission_denied", { gate: "civic", via: "defer" });
        onGateDefer();
      }}
      isOpen={entryMode === "upsell" || unlocked}
    >
      {inner}
    </GateWrapper>
  );
}
