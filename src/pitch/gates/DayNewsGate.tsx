import { useEffect, useState } from "react";
import type { FallbackProduct, PitchGateBaseProps } from "../types";
import { GateWrapper } from "../components/GateWrapper";
import { PositionLadder } from "../components/PositionLadder";
import { SlotStatusBar } from "../components/SlotStatusBar";
import { SlotFullFallback } from "../components/SlotFullFallback";
import { ProductCard } from "../components/ProductCard";

export function DayNewsGate({
  session,
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
  const [addedInfluencer, setAddedInfluencer] = useState(false);
  const [addedNewsletter, setAddedNewsletter] = useState(false);
  const [skippedNewsletter, setSkippedNewsletter] = useState(false);

  const inf = slotData.influencer ?? { total: 8, held: 5, available: 3, status: "open" as const };
  const head = slotData.headliner ?? { total: 1, held: 1, available: 0, status: "full" as const, heldBy: "Bay Bistro" };

  const headlinerFull = head.status === "full" || head.available === 0;
  const competitor = "A top local competitor";

  const permissionAsk = `Your business already has a basic listing in our network. Can I take two minutes to show you what the difference looks like between where you are now and where the top ${profile.category} businesses in ${profile.communityName} appear?`;

  const goalRationale = session.discoveryAnswers?.goal
    ? `You said ${session.discoveryAnswers.goal} — Community Influencer is the foundation that earns visible placement and recurring mentions.`
    : "Community Influencer is the foundation that earns visible placement and recurring mentions in the daily conversation.";

  const fallbackChips: FallbackProduct[] = [
    { id: "sec-local", label: "Local Business" },
    { id: "sec-events", label: "Events & Culture" },
    { id: "sec-wellness", label: "Health & Wellness" },
  ];

  function handleYes() {
    setUnlocked(true);
    onLogEvent("gate_permission_granted", { gate: "day_news" });
  }

  useEffect(() => {
    if (entryMode !== "pitch" || !unlocked) return;
    onLogEvent("product_presented", {
      gate: "day_news",
      products: ["Community Influencer", "Newsletter Sponsor", "Section Sponsor"],
    });
  }, [unlocked, entryMode, onLogEvent]);

  const inner = (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold md:text-3xl" style={{ color: "var(--p-text)" }}>
        Here&apos;s where {profile.businessName} stands in {profile.communityName} right now.
      </h2>

      <PositionLadder
        title="Position ladder"
        positions={[
          { label: "Headliner", sublabel: `${competitor} holds this`, tier: "premium" },
          { label: "Priority Listing", sublabel: "You'd be here with Influencer", highlight: true, tier: "premium" },
          { label: "Priority Listing", highlight: true, tier: "premium" },
          {
            label: `Basic listing — ${profile.businessName}`,
            isCurrentPosition: true,
            tier: "basic",
          },
          { label: "Basic listing", tier: "basic" },
          { label: "Basic listing", tier: "basic" },
        ]}
      />

      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--p-label)" }}>
          Community Influencer slots in {profile.communityName}
        </p>
        <SlotStatusBar
          total={inf.total}
          held={inf.held}
          category="Influencer"
          community={profile.communityName}
          heldBy={inf.heldBy}
        />
        <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--p-label)" }}>
          Headliner in {profile.category}
        </p>
        <SlotStatusBar
          total={head.total}
          held={head.held}
          category="Headliner"
          community={profile.communityName}
          heldBy={head.heldBy}
        />
      </div>

      {headlinerFull ? (
        <SlotFullFallback
          slotType="headliner"
          heldBy={head.heldBy ?? "Another business"}
          fallbackProducts={[{ id: "priority", label: "Priority Listing" }]}
          onSelectFallback={() =>
            onProductAdd({ product: "Priority Listing", price: 150 })
          }
          onSkip={() => onProductSkip("priority_listing")}
        />
      ) : null}

      <ProductCard
        name="Community Influencer"
        price="$300/mo"
        description="Premium listing across the network, one article a month, five announcements, priority position, and 25% off any advertising you add."
        rationale={goalRationale}
        slotStatus={inf}
        slotMeta={{ category: profile.category, community: profile.communityName }}
        included={false}
        isAdded={addedInfluencer}
        onAdd={() => {
          setAddedInfluencer(true);
          onProductAdd({ product: "Community Influencer", price: 300 });
          onLogEvent("product_accepted", { gate: "day_news", product: "Community Influencer" });
        }}
        onSkip={() => {
          setAddedInfluencer(false);
          onProductSkip("community_influencer");
        }}
        onRemove={() => {
          setAddedInfluencer(false);
          onProductSkip("community_influencer");
        }}
        onDefer={() => onProductDefer?.("community_influencer")}
      />

      {!headlinerFull && !addedNewsletter && !skippedNewsletter ? (
        <ProductCard
          name="Newsletter Sponsor"
          price="$150–300/send"
          description="Top of the morning newsletter — every subscriber sees it before they read anything else. One slot per community."
        onAdd={() => {
          setAddedNewsletter(true);
          onProductAdd({ product: "Newsletter Sponsor", price: 225 });
          onLogEvent("product_accepted", { gate: "day_news", product: "Newsletter Sponsor" });
        }}
        onSkip={() => {
          setSkippedNewsletter(true);
          onProductSkip("newsletter_sponsor");
          onLogEvent("product_declined", { gate: "day_news", product: "newsletter_sponsor" });
        }}
          onDefer={() => onProductDefer?.("newsletter_sponsor")}
        />
      ) : null}

      {headlinerFull ? (
        <ProductCard
          name="Section Sponsor"
          price="from $300/mo"
          description="Own a section of the news. Every article in that section carries your name — persistently, not rotationally."
          onAdd={() => {
            onProductAdd({ product: "Section Sponsor", price: 300 });
            onLogEvent("product_accepted", { gate: "day_news", product: "Section Sponsor" });
          }}
          onSkip={() => {
            onProductSkip("section_sponsor");
            onLogEvent("product_declined", { gate: "day_news", product: "section_sponsor" });
          }}
          onDefer={() => onProductDefer?.("section_sponsor")}
        />
      ) : null}

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
      onYes={handleYes}
      onSkip={() => {
        onLogEvent("gate_permission_denied", { gate: "day_news", via: "skip" });
        onGateDefer();
      }}
      onDefer={() => {
        onLogEvent("gate_permission_denied", { gate: "day_news", via: "defer" });
        onGateDefer();
      }}
      isOpen={entryMode === "upsell" || unlocked}
    >
      {inner}
    </GateWrapper>
  );
}
