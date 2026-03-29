import { useState } from "react";
import type { PitchGateBaseProps } from "../types";
import { GateWrapper } from "../components/GateWrapper";
import { ProductCard } from "../components/ProductCard";
import { SlotStatusBar } from "../components/SlotStatusBar";
import { SlotFullFallback } from "../components/SlotFullFallback";

export function DowntownGuideGate({
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

  const dtg = slotData.dtg_headliner ?? { total: 1, held: 0, available: 1, status: "open" as const };
  const dtgFull = dtg.status === "full" || dtg.available === 0;

  const permissionAsk = `Because you have a physical location, the Downtown Guide is worth understanding. It's where ${profile.communityName} residents search for places to go and shop. Can I show you what your listing looks like there?`;

  function handleYes() {
    setUnlocked(true);
    onLogEvent("gate_permission_granted", { gate: "downtown_guide" });
  }

  const inner = (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold md:text-3xl" style={{ color: "var(--p-text)" }}>
        The Downtown Guide is how {profile.communityName} finds local businesses.
      </h2>

      <div className="grid gap-4 md:grid-cols-2">
        <CompareCol
          title="YOUR LISTING NOW"
          variant="bad"
          lines={[
            "Name and address only",
            "No photos",
            "No description",
            "No coupons",
            "Bottom of search results",
          ]}
        />
        <CompareCol
          title="WITH PREMIUM LISTING"
          variant="good"
          lines={[
            "20 photos + video",
            "Full description",
            "Menu or service list",
            "Verified badge",
            "Digital coupons",
            "Priority sort position",
            "Analytics",
          ]}
        />
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--p-label)" }}>
          DTG Headliner — {profile.category}
        </p>
        <SlotStatusBar
          total={dtg.total}
          held={dtg.held}
          category="Headliner"
          community={profile.communityName}
          heldBy={dtg.heldBy}
        />
      </div>

      <ProductCard
        name="Premium Listing"
        price="Included"
        description="Full photo gallery, extended description, verified badge, coupons, and analytics — the difference between a placeholder and a real presence."
        included
        onAdd={() => {
          onProductAdd({ product: "Premium Listing (DTG)", price: 0 });
          onLogEvent("product_accepted", { gate: "downtown_guide", product: "Premium Listing (DTG)" });
        }}
        onSkip={() => {
          onProductSkip("premium_listing_dtg");
          onLogEvent("product_declined", { gate: "downtown_guide", product: "premium_listing_dtg" });
        }}
      />

      {dtgFull ? (
        <SlotFullFallback
          slotType="headliner"
          heldBy={dtg.heldBy ?? "Another business"}
          fallbackProducts={[{ id: "pl", label: "Priority Listing" }]}
          onSelectFallback={() => {
            onProductAdd({ product: "DTG Priority Listing", price: 150 });
            onLogEvent("product_accepted", { gate: "downtown_guide", product: "DTG Priority Listing" });
          }}
          onSkip={() => {
            onProductSkip("dtg_fallback");
            onLogEvent("product_declined", { gate: "downtown_guide", product: "dtg_fallback" });
          }}
        />
      ) : (
        <ProductCard
          name={`Headliner — ${profile.category}`}
          price="from $150/mo"
          description="Top card every time someone browses your category in the Downtown Guide."
          slotStatus={dtg}
          slotMeta={{ category: profile.category, community: profile.communityName }}
          onAdd={() => {
            onProductAdd({ product: "Downtown Guide Headliner", price: 200 });
            onLogEvent("product_accepted", { gate: "downtown_guide", product: "Downtown Guide Headliner" });
          }}
          onSkip={() => {
            onProductSkip("dtg_headliner");
            onLogEvent("product_declined", { gate: "downtown_guide", product: "dtg_headliner" });
          }}
          onDefer={() => {
            onProductDefer?.("dtg_headliner");
            onLogEvent("product_deferred", { gate: "downtown_guide", product: "dtg_headliner" });
          }}
        />
      )}

      <ProductCard
        name="Poll Featured"
        price="$49"
        description="Photo and offer in the Community's Choice poll listing."
        onAdd={() => {
          onProductAdd({ product: "Poll Featured", price: 49 });
          onLogEvent("product_accepted", { gate: "downtown_guide", product: "Poll Featured" });
        }}
        onSkip={() => {
          onProductSkip("poll_featured");
          onLogEvent("product_declined", { gate: "downtown_guide", product: "poll_featured" });
        }}
      />
      <ProductCard
        name="Poll Premium"
        price="$149"
        description="Highlighted position at the top with sponsored badge."
        onAdd={() => {
          onProductAdd({ product: "Poll Premium", price: 149 });
          onLogEvent("product_accepted", { gate: "downtown_guide", product: "Poll Premium" });
        }}
        onSkip={() => {
          onProductSkip("poll_premium");
          onLogEvent("product_declined", { gate: "downtown_guide", product: "poll_premium" });
        }}
      />

      <div className="flex flex-wrap gap-2 border-t pt-4" style={{ borderColor: "var(--p-border)" }}>
        <button
          type="button"
          onClick={() => {
            onLogEvent("gate_completed", { gate: "downtown_guide" });
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
        onLogEvent("gate_permission_denied", { gate: "downtown_guide", via: "skip" });
        onGateDefer();
      }}
      onDefer={() => {
        onLogEvent("gate_permission_denied", { gate: "downtown_guide", via: "defer" });
        onGateDefer();
      }}
      isOpen={entryMode === "upsell" || unlocked}
    >
      {inner}
    </GateWrapper>
  );
}

function CompareCol({
  title,
  lines,
  variant,
}: {
  title: string;
  lines: string[];
  variant: "good" | "bad";
}) {
  const mark = variant === "good" ? "✓" : "✗";
  const color = variant === "good" ? "var(--p-green)" : "var(--p-muted)";
  return (
    <div
      className="rounded-[var(--p-radius-lg)] border p-4"
      style={{ borderColor: "var(--p-border)", backgroundColor: "var(--p-card)" }}
    >
      <h3 className="text-xs font-bold uppercase tracking-wide" style={{ color: "var(--p-label)" }}>
        {title}
      </h3>
      <ul className="mt-3 space-y-2 text-sm" style={{ color: "var(--p-text)" }}>
        {lines.map((line) => (
          <li key={line} className="flex gap-2">
            <span style={{ color }} aria-hidden>
              {mark}
            </span>
            {line}
          </li>
        ))}
      </ul>
    </div>
  );
}
