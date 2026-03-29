/**
 * Development-only preview of Sarah Pitch primitives, steps, and gates.
 * Routed at /pitch-dev when import.meta.env.DEV is true.
 */
import { useCallback, useState } from "react";
import "./tokens.css";
import { PITCH_PROGRESS_STEPS } from "./_constants";
import type {
  AcceptedProduct,
  BusinessProfile,
  PitchSession,
  SarahMessage,
  SlotStatus,
} from "./types";
import { PitchShell } from "./shell/PitchShell";
import { SarahPanel } from "./shell/SarahPanel";
import { UpsellShell } from "./shell/UpsellShell";
import { PitchHeader } from "./shell/PitchHeader";
import { PitchProgressBar } from "./shell/PitchProgressBar";
import { SlotStatusBar } from "./components/SlotStatusBar";
import { ProductCard } from "./components/ProductCard";
import { GateWrapper } from "./components/GateWrapper";
import { PositionLadder } from "./components/PositionLadder";
import { SlotFullFallback } from "./components/SlotFullFallback";
import { FastPathNav } from "./components/FastPathNav";
import { ResumePrompt } from "./components/ResumePrompt";
import { IdentifyStep } from "./steps/IdentifyStep";
import { ProfileTypeStep } from "./steps/ProfileTypeStep";
import { CommunityStep } from "./steps/CommunityStep";
import { GoalsStep } from "./steps/GoalsStep";
import { ProposalStep } from "./steps/ProposalStep";
import { DayNewsGate } from "./gates/DayNewsGate";
import { DowntownGuideGate } from "./gates/DowntownGuideGate";
import { EventHostGate } from "./gates/EventHostGate";
import { VenueGate } from "./gates/VenueGate";
import { PerformerGate } from "./gates/PerformerGate";
import { GoLocalVoicesGate } from "./gates/GoLocalVoicesGate";
import { AlphaSiteGate } from "./gates/AlphaSiteGate";
import { CivicGate } from "./gates/CivicGate";
import { GateSequencer } from "./gates/GateSequencer";

const mockSession: PitchSession = {
  id: "preview-session",
  communityId: "1",
  entryPlatform: "day_news",
  status: "pitching",
  lastStep: "goals",
  businessName: "Shoreline Coffee",
  businessCategory: "Restaurant",
  primaryCommunityName: "Clearwater",
  countyName: "Pinellas",
  orgType: "smb",
  pitchTrack: "standard",
  hasPhysicalLocation: true,
  hasEvents: "regularly",
  discoveryAnswers: {
    goal: "More foot traffic",
    goalKey: "foot_traffic",
    customerSource: "Word of mouth",
    marketingSpend: "Yes, but not getting results",
  },
  productsAccepted: [
    { product: "Community Influencer", price: 300 },
    { product: "Event Headliner", price: 200 },
  ],
};

const mockProfile: BusinessProfile = {
  businessName: "Shoreline Coffee",
  category: "Restaurant",
  communityName: "Clearwater",
  county: "Pinellas",
  pitchTrack: "standard",
  orgType: "smb",
  hasPhysicalLocation: true,
  hasEvents: "regularly",
  expertiseLabel: "chef",
  contactFirstName: "Jordan",
  serviceSearchTerm: "coffee shop",
  categorySuggestsPhoneIntake: true,
};

const mockSlotData: Record<string, SlotStatus> = {
  influencer: { total: 8, held: 5, available: 3, status: "open" },
  headliner: { total: 1, held: 1, available: 0, status: "full", heldBy: "Bay Bistro" },
  dtg_headliner: { total: 1, held: 0, available: 1, status: "open" },
  gec_event_headliner: { total: 6, held: 5, available: 1, status: "almost_full" },
  gec_venue_headliner: { total: 4, held: 2, available: 2, status: "open" },
  gec_performer_headliner: { total: 5, held: 5, available: 0, status: "full", heldBy: "Harbor Jazz" },
  glv_expert_column: { total: 3, held: 2, available: 1, status: "almost_full" },
};

const baseMessages: SarahMessage[] = [
  {
    id: "1",
    text: "Hi — I'm Sarah, your account manager. This preview shows steps, gates, and shared components.",
    timestamp: "Just now",
  },
];

function noop() {
  undefined;
}

export default function DevPreview() {
  const [messages, setMessages] = useState<SarahMessage[]>(baseMessages);
  const [planSubLabel, setPlanSubLabel] = useState("Day.News");
  const appendSarah = useCallback((text: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `m-${Date.now()}`,
        text,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  }, []);

  const logEvent = useCallback((type: string, payload?: Record<string, unknown>) => {
    appendSarah(`[event] ${type}${payload ? ` — ${JSON.stringify(payload)}` : ""}`);
  }, [appendSarah]);

  const slotOpen: SlotStatus = { total: 8, held: 3, available: 5, status: "open" };
  const slotLow: SlotStatus = { total: 6, held: 5, available: 1, status: "almost_full" };
  const slotFull: SlotStatus = { total: 4, held: 4, available: 0, status: "full", heldBy: "Harbor Grille" };

  const fallbackChips = [
    { id: "1", label: "Waterfront" },
    { id: "2", label: "Downtown" },
    { id: "3", label: "North District" },
  ];

  const samplePanel = (
    <SarahPanel
      messages={messages}
      isTyping={false}
      onSend={(t) => appendSarah(t)}
    />
  );

  const gateShellProps = useCallback(
    (entryMode: "pitch" | "upsell") => ({
      session: mockSession,
      profile: mockProfile,
      slotData: mockSlotData,
      entryMode,
      onProductAdd: (p: AcceptedProduct) => appendSarah(`Added: ${p.product} ($${p.price})`),
      onProductSkip: (id: string) => appendSarah(`Skipped: ${id}`),
      onProductDefer: (id: string) => appendSarah(`Deferred: ${id}`),
      onGateComplete: () => appendSarah("Gate complete →"),
      onGateDefer: () => appendSarah("Gate deferred"),
      onLogEvent: logEvent,
    }),
    [appendSarah, logEvent]
  );

  return (
    <div className="pitch-root min-h-screen" style={{ backgroundColor: "var(--p-bg)" }}>
      <div className="mx-auto max-w-[1200px] space-y-16 px-4 py-10" style={{ color: "var(--p-text)" }}>
        <header className="space-y-2">
          <h1 className="text-2xl font-bold">Sarah Pitch — design system & flow preview</h1>
          <p className="text-sm" style={{ color: "var(--p-muted)" }}>
            Development route only. Session id (mock): {mockSession.id}
          </p>
        </header>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Pitch steps (left-panel content)</h2>
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="rounded-[var(--p-radius-lg)] border p-4" style={{ borderColor: "var(--p-border)" }}>
              <p className="mb-3 text-xs font-bold uppercase tracking-wide" style={{ color: "var(--p-label)" }}>
                IdentifyStep
              </p>
              <IdentifyStep
                session={mockSession}
                onNext={(d) => appendSarah(`Identify next: ${JSON.stringify(d)}`)}
                onBack={noop}
                onLogEvent={logEvent}
                onSarahMessage={appendSarah}
              />
            </div>
            <div className="rounded-[var(--p-radius-lg)] border p-4" style={{ borderColor: "var(--p-border)" }}>
              <p className="mb-3 text-xs font-bold uppercase tracking-wide" style={{ color: "var(--p-label)" }}>
                ProfileTypeStep
              </p>
              <ProfileTypeStep
                session={mockSession}
                onNext={(d) => appendSarah(`Profile next: ${JSON.stringify(d)}`)}
                onBack={noop}
                onLogEvent={logEvent}
                onSarahMessage={appendSarah}
              />
            </div>
            <div className="rounded-[var(--p-radius-lg)] border p-4" style={{ borderColor: "var(--p-border)" }}>
              <p className="mb-3 text-xs font-bold uppercase tracking-wide" style={{ color: "var(--p-label)" }}>
                CommunityStep (live API when reachable)
              </p>
              <CommunityStep
                session={mockSession}
                onNext={(d) => appendSarah(`Community next: ${JSON.stringify(d)}`)}
                onBack={noop}
                onLogEvent={logEvent}
                onSarahMessage={appendSarah}
              />
            </div>
            <div className="rounded-[var(--p-radius-lg)] border p-4" style={{ borderColor: "var(--p-border)" }}>
              <p className="mb-3 text-xs font-bold uppercase tracking-wide" style={{ color: "var(--p-label)" }}>
                GoalsStep
              </p>
              <GoalsStep
                session={mockSession}
                onNext={(d) => appendSarah(`Goals next: ${JSON.stringify(d)}`)}
                onBack={noop}
                onLogEvent={logEvent}
                onSarahMessage={appendSarah}
                influencerSlotHint={slotLow}
              />
            </div>
            <div className="rounded-[var(--p-radius-lg)] border p-4 lg:col-span-2" style={{ borderColor: "var(--p-border)" }}>
              <p className="mb-3 text-xs font-bold uppercase tracking-wide" style={{ color: "var(--p-label)" }}>
                ProposalStep
              </p>
              <ProposalStep
                session={mockSession}
                onNext={() => appendSarah("Proposal continue")}
                onBack={noop}
                onLogEvent={logEvent}
                onSarahMessage={appendSarah}
                founderDaysRemaining={12}
                influencerSlot={slotLow}
              />
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Gates — pitch vs upsell (both entry modes)</h2>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-[var(--p-radius-lg)] border p-4" style={{ borderColor: "var(--p-border)" }}>
              <p className="mb-2 text-xs font-bold uppercase tracking-wide" style={{ color: "var(--p-label)" }}>
                DayNewsGate — pitch
              </p>
              <DayNewsGate {...gateShellProps("pitch")} />
            </div>
            <div className="rounded-[var(--p-radius-lg)] border p-4" style={{ borderColor: "var(--p-border)" }}>
              <p className="mb-2 text-xs font-bold uppercase tracking-wide" style={{ color: "var(--p-label)" }}>
                DayNewsGate — upsell
              </p>
              <DayNewsGate {...gateShellProps("upsell")} />
            </div>
            <div className="rounded-[var(--p-radius-lg)] border p-4" style={{ borderColor: "var(--p-border)" }}>
              <p className="mb-2 text-xs font-bold uppercase tracking-wide" style={{ color: "var(--p-label)" }}>
                DowntownGuideGate — pitch
              </p>
              <DowntownGuideGate {...gateShellProps("pitch")} />
            </div>
            <div className="rounded-[var(--p-radius-lg)] border p-4" style={{ borderColor: "var(--p-border)" }}>
              <p className="mb-2 text-xs font-bold uppercase tracking-wide" style={{ color: "var(--p-label)" }}>
                EventHostGate — pitch (retention goal)
              </p>
              <EventHostGate
                {...gateShellProps("pitch")}
                session={{
                  ...mockSession,
                  discoveryAnswers: {
                    ...mockSession.discoveryAnswers!,
                    goalKey: "retention",
                  },
                }}
              />
            </div>
            <div className="rounded-[var(--p-radius-lg)] border p-4" style={{ borderColor: "var(--p-border)" }}>
              <p className="mb-2 text-xs font-bold uppercase tracking-wide" style={{ color: "var(--p-label)" }}>
                VenueGate — standalone
              </p>
              <VenueGate {...gateShellProps("pitch")} />
            </div>
            <div className="rounded-[var(--p-radius-lg)] border p-4" style={{ borderColor: "var(--p-border)" }}>
              <p className="mb-2 text-xs font-bold uppercase tracking-wide" style={{ color: "var(--p-label)" }}>
                PerformerGate — upsell
              </p>
              <PerformerGate {...gateShellProps("upsell")} />
            </div>
            <div className="rounded-[var(--p-radius-lg)] border p-4" style={{ borderColor: "var(--p-border)" }}>
              <p className="mb-2 text-xs font-bold uppercase tracking-wide" style={{ color: "var(--p-label)" }}>
                GoLocalVoicesGate — pitch
              </p>
              <GoLocalVoicesGate {...gateShellProps("pitch")} />
            </div>
            <div className="rounded-[var(--p-radius-lg)] border p-4" style={{ borderColor: "var(--p-border)" }}>
              <p className="mb-2 text-xs font-bold uppercase tracking-wide" style={{ color: "var(--p-label)" }}>
                CivicGate — pitch
              </p>
              <CivicGate
                {...gateShellProps("pitch")}
                profile={{
                  ...mockProfile,
                  orgType: "school",
                  pitchTrack: "civic",
                }}
              />
            </div>
            <div className="rounded-[var(--p-radius-lg)] border p-4" style={{ borderColor: "var(--p-border)" }}>
              <p className="mb-2 text-xs font-bold uppercase tracking-wide" style={{ color: "var(--p-label)" }}>
                AlphaSiteGate — pitch (qualifying → permission)
              </p>
              <AlphaSiteGate {...gateShellProps("pitch")} />
            </div>
            <div className="rounded-[var(--p-radius-lg)] border p-4" style={{ borderColor: "var(--p-border)" }}>
              <p className="mb-2 text-xs font-bold uppercase tracking-wide" style={{ color: "var(--p-label)" }}>
                AlphaSiteGate — upsell (content immediate after qualifier)
              </p>
              <AlphaSiteGate {...gateShellProps("upsell")} />
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">GateSequencer (mock)</h2>
          <p className="text-sm" style={{ color: "var(--p-muted)" }}>
            Progress sub-label: {planSubLabel}. Use Continue on each gate to advance; Fast Path jumps.
          </p>
          <div
            className="rounded-[var(--p-radius-lg)] border p-4"
            style={{ borderColor: "var(--p-border)", backgroundColor: "var(--p-panel)" }}
          >
            <PitchProgressBar
              steps={PITCH_PROGRESS_STEPS.slice(0, 6)}
              currentStep={4}
              completedSteps={[1, 2, 3]}
              subLabel={planSubLabel}
            />
            <div className="mt-6">
              <GateSequencer
                session={mockSession}
                profile={mockProfile}
                slotData={mockSlotData}
                entryMode="pitch"
                profileComplete
                onProgressSubLabel={setPlanSubLabel}
                onSessionProductAdd={(p) => appendSarah(`Sequencer saved: ${p.product}`)}
                onGateComplete={(gate, products) =>
                  appendSarah(`Completed gate ${gate} with ${products.length} products`)
                }
                onGateDefer={(gate, reason) => appendSarah(`Deferred ${gate}: ${reason}`)}
                onAllGatesComplete={() => appendSarah("All gates complete")}
                onLogEvent={logEvent}
              />
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">PitchProgressBar (isolated)</h2>
          <div className="rounded-[var(--p-radius-lg)] border p-4" style={{ borderColor: "var(--p-border)" }}>
            <PitchProgressBar
              steps={PITCH_PROGRESS_STEPS.slice(0, 6)}
              currentStep={3}
              completedSteps={[1, 2]}
              subLabel="Events →"
            />
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">PitchHeader (isolated)</h2>
          <div
            className="relative h-24 overflow-hidden rounded-[var(--p-radius-lg)] border"
            style={{ borderColor: "var(--p-border)" }}
          >
            <PitchHeader
              currentStep={4}
              steps={PITCH_PROGRESS_STEPS}
              completedSteps={[1, 2, 3]}
              subLabel="Your plan"
              onClose={() => undefined}
            />
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">SlotStatusBar — open / almost full / full</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-[var(--p-radius-lg)] border p-4" style={{ borderColor: "var(--p-border)" }}>
              <SlotStatusBar
                total={slotOpen.total}
                held={slotOpen.held}
                category="Influencer"
                community="Clearwater"
              />
            </div>
            <div className="rounded-[var(--p-radius-lg)] border p-4" style={{ borderColor: "var(--p-border)" }}>
              <SlotStatusBar
                total={slotLow.total}
                held={slotLow.held}
                category="Headliner"
                community="St. Pete"
              />
            </div>
            <div className="rounded-[var(--p-radius-lg)] border p-4" style={{ borderColor: "var(--p-border)" }}>
              <SlotStatusBar
                total={slotFull.total}
                held={slotFull.held}
                category="Expert column"
                community="Tampa Bay"
                heldBy={slotFull.heldBy}
              />
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">ProductCard — default / added / skipped</h2>
          <div className="grid gap-4 lg:grid-cols-3">
            <ProductCard
              name="Priority Listing"
              price="from $150/mo"
              description="Stay above the fold when locals search your category."
              rationale="You said discovery matters — this puts you where buyers look first."
              slotStatus={slotOpen}
              slotMeta={{ category: "Listings", community: "Clearwater" }}
              onAdd={() => undefined}
              onSkip={() => undefined}
              onDefer={() => undefined}
            />
            <ProductCard
              name="Section Sponsor"
              price="$300/mo"
              description="Own the sponsorship for a full section — no cap on placements."
              onAdd={() => undefined}
              onSkip={() => undefined}
              isAdded
              onRemove={() => undefined}
            />
            <ProductCard
              name="Event Spotlight"
              price="1–5% commission"
              description="Sell more tickets with highlighted placement during peak weeks."
              onAdd={() => undefined}
              onSkip={() => undefined}
              isSkipped
            />
          </div>
          <ProductCard
            name="Founder bundle"
            price="—"
            description="Everything you need to launch in one consolidated package."
            included
            onAdd={() => undefined}
            onSkip={() => undefined}
          />
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">GateWrapper — pitch vs upsell</h2>
          <div className="grid gap-8 md:grid-cols-2">
            <GateWrapper
              entryMode="pitch"
              permissionAsk="Want to see how Day.News would position you this quarter?"
              tellMeMore="We'll walk through real inventory, not a generic menu — you can skip anything that isn't a fit."
              onYes={() => undefined}
              onSkip={() => undefined}
              onDefer={() => undefined}
            >
              <p className="p-4 text-sm" style={{ color: "var(--p-muted)" }}>
                Gate content appears here after “Yes, show me”.
              </p>
            </GateWrapper>
            <GateWrapper entryMode="upsell" permissionAsk="" onYes={() => undefined} onSkip={() => undefined}>
              <p className="p-4 text-sm" style={{ color: "var(--p-muted)" }}>
                Upsell mode: no permission block — children show immediately.
              </p>
            </GateWrapper>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">PositionLadder</h2>
          <div className="rounded-[var(--p-radius-lg)] border p-4" style={{ borderColor: "var(--p-border)" }}>
            <PositionLadder
              title="Where you show up"
              positions={[
                { label: "Premier partner", sublabel: "Top rotation across the digest", tier: "premium" },
                { label: "Featured merchant", sublabel: "Featured row + mention", highlight: true, tier: "premium" },
                { label: "Standard merchant", sublabel: "Directory listing", tier: "basic" },
                { label: "Starter", sublabel: "Included baseline", isCurrentPosition: true, tier: "basic" },
              ]}
            />
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">SlotFullFallback</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <SlotFullFallback
              slotType="influencer"
              category="Arts & Culture"
              fallbackProducts={fallbackChips}
              onSelectFallback={() => undefined}
              onSkip={() => undefined}
            />
            <SlotFullFallback
              slotType="headliner"
              heldBy="Bayfront Events"
              fallbackProducts={[{ id: "pl", label: "Priority Listing" }]}
              onSelectFallback={() => undefined}
              onSkip={() => undefined}
            />
            <SlotFullFallback
              slotType="expert_column"
              community="Harbor District"
              nearbyOptions={[
                { communityName: "Midtown", available: 2 },
                { communityName: "North Shore", available: 1 },
              ]}
              fallbackProducts={fallbackChips}
              onSelectFallback={() => undefined}
              onSkip={() => undefined}
            />
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">FastPathNav</h2>
          <FastPathNav
            availableGates={[
              { key: "day_news", label: "Day.News", icon: "●" },
              { key: "downtown_guide", label: "Downtown Guide", icon: "●" },
              { key: "alphasite", label: "AlphaSite", icon: "●" },
            ]}
            onSelect={() => undefined}
            onCollapse={() => undefined}
          />
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">ResumePrompt</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <ResumePrompt
              variant="same_browser"
              businessName="Shoreline Coffee"
              communityName="Clearwater"
              lastStep="Goals"
              nextStepLabel="Your plan"
              onResume={() => undefined}
              onStartFresh={() => undefined}
              onDifferentBusiness={() => undefined}
            />
            <ResumePrompt
              variant="email_link"
              businessName="Shoreline Coffee"
              communityName="Clearwater"
              lastStep="Proposal"
              nextStepLabel="Checkout"
              slotUpdate={{ category: "Headliner", wasAvailable: 2, nowAvailable: 0 }}
              onResume={() => undefined}
              onStartFresh={() => undefined}
              onDifferentBusiness={() => undefined}
            />
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Full PitchShell + SarahPanel</h2>
          <div className="relative h-[560px] overflow-hidden rounded-[var(--p-radius-lg)] border shadow-xl" style={{ borderColor: "var(--p-border)" }}>
            <PitchShell
              embed
              onClose={() => undefined}
              currentStep={3}
              steps={PITCH_PROGRESS_STEPS}
              completedSteps={[1, 2]}
              progressSubLabel="Pick your community"
              rightPanel={samplePanel}
            >
              <p className="text-2xl font-bold">Left panel content</p>
              <p className="mt-2 max-w-prose text-sm" style={{ color: "var(--p-muted)" }}>
                Resize below 768px to verify the right panel becomes a bottom drawer with an “Ask Sarah” control.
              </p>
            </PitchShell>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">UpsellShell</h2>
          <div className="relative h-[480px] overflow-hidden rounded-[var(--p-radius-lg)] border shadow-xl" style={{ borderColor: "var(--p-border)" }}>
            <UpsellShell
              embed
              gateName="Downtown Guide upgrade"
              businessName="Shoreline Coffee"
              communityName="Clearwater"
              onClose={() => undefined}
              rightPanel={
                <SarahPanel
                  messages={[
                    {
                      id: "u1",
                      text: "Here's what changes if you add the Downtown Guide package today.",
                      timestamp: "Now",
                    },
                  ]}
                />
              }
            >
              <p className="text-xl font-semibold">Upsell body</p>
              <p className="mt-2 text-sm" style={{ color: "var(--p-muted)" }}>
                No progress rail — header is gate + business only.
              </p>
            </UpsellShell>
          </div>
        </section>
      </div>
    </div>
  );
}
