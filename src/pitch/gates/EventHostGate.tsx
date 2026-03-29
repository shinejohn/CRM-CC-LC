import { useState } from "react";
import type { PitchGateBaseProps } from "../types";
import { GateWrapper } from "../components/GateWrapper";
import { ProductCard } from "../components/ProductCard";
import { SlotStatusBar } from "../components/SlotStatusBar";
import { VenueGate } from "./VenueGate";
import { PerformerGate } from "./PerformerGate";

export function EventHostGate(props: PitchGateBaseProps) {
  const {
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
  } = props;

  const [unlocked, setUnlocked] = useState(false);
  const [venueYes, setVenueYes] = useState<boolean | null>(null);
  const [performerYes, setPerformerYes] = useState<boolean | null>(null);

  const eventHead = slotData.gec_event_headliner ?? {
    total: 4,
    held: 3,
    available: 1,
    status: "almost_full" as const,
  };

  const permissionAsk =
    "Something that can really drive traffic for a business like yours is promoting events properly — even smaller ones like tastings, classes, or pop-ups. Can I give you two minutes on how it works?";

  function handleYes() {
    setUnlocked(true);
    onLogEvent("gate_permission_granted", { gate: "event_host" });
  }

  const showVenueToggle = profile.orgType === "smb" || profile.orgType === "venue";
  const showPerformerToggle = profile.orgType === "smb";

  const retentionGoal = session.discoveryAnswers?.goalKey === "retention";

  const inner = (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold md:text-3xl" style={{ color: "var(--p-text)" }}>
        GoEventCity is {profile.communityName}&apos;s event calendar. Here&apos;s how to be seen in it.
      </h2>

      <EventCalendarVisual community={profile.communityName} />

      <div>
        <h3 className="text-xs font-bold uppercase tracking-wide" style={{ color: "var(--p-label)" }}>
          Included in your plan
        </h3>
        <ul className="mt-2 space-y-2 text-sm" style={{ color: "var(--p-muted)" }}>
          <li className="flex gap-2">
            <span style={{ color: "var(--p-teal)" }}>✓</span>1 premium event per month — priority placed
          </li>
          <li className="flex gap-2">
            <span style={{ color: "var(--p-teal)" }}>✓</span>
            Cross-posted to Day.News morning feed automatically
          </li>
          <li className="flex gap-2">
            <span style={{ color: "var(--p-teal)" }}>✓</span>
            Reminder sent to everyone who registers
          </li>
          <li className="flex gap-2">
            <span style={{ color: "var(--p-teal)" }}>✓</span>
            Distributed to community social accounts
          </li>
        </ul>
      </div>

      <ProductCard
        name="Event Headliner"
        price="from $150/mo"
        description="First card in your event category when residents browse what's on."
        slotStatus={eventHead}
        slotMeta={{ category: profile.category, community: profile.communityName }}
        onAdd={() => {
          onProductAdd({ product: "Event Headliner", price: 200 });
          onLogEvent("product_accepted", { gate: "event_host", product: "Event Headliner" });
        }}
        onSkip={() => {
          onProductSkip("event_headliner");
          onLogEvent("product_declined", { gate: "event_host", product: "event_headliner" });
        }}
        onDefer={() => {
          onProductDefer?.("event_headliner");
          onLogEvent("product_deferred", { gate: "event_host", product: "event_headliner" });
        }}
      />

      <ProductCard
        name="Ticket Sales"
        price="1–5% commission"
        description="Advance ticket purchase online — promo codes, known headcount, lower commission than most ticketing services."
        onAdd={() => {
          onProductAdd({ product: "Ticket Sales", price: 0 });
          onLogEvent("product_accepted", { gate: "event_host", product: "Ticket Sales" });
        }}
        onSkip={() => {
          onProductSkip("ticket_sales");
          onLogEvent("product_declined", { gate: "event_host", product: "ticket_sales" });
        }}
      />

      <ProductCard
        name="Calendar Subscription"
        price="$19–49/mo"
        description="Customers subscribe once and get notified every time you add a new event — no social feed standing between you and them."
        onAdd={() => {
          onProductAdd({ product: "Calendar Subscription", price: 35 });
          onLogEvent("product_accepted", { gate: "event_host", product: "Calendar Subscription" });
        }}
        onSkip={() => {
          onProductSkip("calendar_subscription");
          onLogEvent("product_declined", { gate: "event_host", product: "calendar_subscription" });
        }}
      />

      {retentionGoal ? (
        <ProductCard
          name="Since You're Going To…"
          price="$25–100/event"
          description="After someone registers, they get a curated follow-up with nearby experiences. Puts your event in front of them a second time."
          onAdd={() => {
            onProductAdd({ product: "Since You're Going To", price: 50 });
            onLogEvent("product_accepted", { gate: "event_host", product: "Since You're Going To" });
          }}
          onSkip={() => {
            onProductSkip("since_youre_going");
            onLogEvent("product_declined", { gate: "event_host", product: "since_youre_going" });
          }}
        />
      ) : null}

      {profile.orgType === "venue" ? (
        <VenueGate {...props} variant="embedded" />
      ) : null}

      {showVenueToggle && profile.orgType !== "venue" ? (
        <div
          className="rounded-[var(--p-radius-lg)] border p-4"
          style={{ borderColor: "var(--p-border)", backgroundColor: "var(--p-panel)" }}
        >
          <p className="text-sm font-semibold" style={{ color: "var(--p-text)" }}>
            Is {profile.businessName} a rentable event space?
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setVenueYes(true)}
              className="rounded-[var(--p-radius-pill)] border px-4 py-2 text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--p-teal)]"
              style={{
                borderColor: venueYes === true ? "var(--p-teal)" : "var(--p-border-light)",
                backgroundColor: venueYes === true ? "var(--p-teal-soft)" : "transparent",
                color: "var(--p-text)",
              }}
            >
              Yes, we book private events
            </button>
            <button
              type="button"
              onClick={() => setVenueYes(false)}
              className="rounded-[var(--p-radius-pill)] border px-4 py-2 text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--p-teal)]"
              style={{
                borderColor: venueYes === false ? "var(--p-teal)" : "var(--p-border-light)",
                backgroundColor: venueYes === false ? "var(--p-teal-soft)" : "transparent",
                color: "var(--p-text)",
              }}
            >
              No
            </button>
          </div>
          {venueYes ? <div className="mt-4 border-t pt-4" style={{ borderColor: "var(--p-border)" }}><VenueGate {...props} variant="embedded" /></div> : null}
        </div>
      ) : null}

      {showPerformerToggle ? (
        <div
          className="rounded-[var(--p-radius-lg)] border p-4"
          style={{ borderColor: "var(--p-border)", backgroundColor: "var(--p-panel)" }}
        >
          <p className="text-sm font-semibold" style={{ color: "var(--p-text)" }}>
            Do you perform or are you available for bookings?
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setPerformerYes(true)}
              className="rounded-[var(--p-radius-pill)] border px-4 py-2 text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--p-teal)]"
              style={{
                borderColor: performerYes === true ? "var(--p-teal)" : "var(--p-border-light)",
                backgroundColor: performerYes === true ? "var(--p-teal-soft)" : "transparent",
                color: "var(--p-text)",
              }}
            >
              Yes, I perform / we book
            </button>
            <button
              type="button"
              onClick={() => setPerformerYes(false)}
              className="rounded-[var(--p-radius-pill)] border px-4 py-2 text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--p-teal)]"
              style={{
                borderColor: performerYes === false ? "var(--p-teal)" : "var(--p-border-light)",
                backgroundColor: performerYes === false ? "var(--p-teal-soft)" : "transparent",
                color: "var(--p-text)",
              }}
            >
              No
            </button>
          </div>
          {performerYes ? (
            <div className="mt-4 border-t pt-4" style={{ borderColor: "var(--p-border)" }}>
              <PerformerGate {...props} variant="embedded" />
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2 border-t pt-4" style={{ borderColor: "var(--p-border)" }}>
        <button
          type="button"
          onClick={() => {
            onLogEvent("gate_completed", { gate: "event_host" });
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
        onLogEvent("gate_permission_denied", { gate: "event_host", via: "skip" });
        onGateDefer();
      }}
      onDefer={() => {
        onLogEvent("gate_permission_denied", { gate: "event_host", via: "defer" });
        onGateDefer();
      }}
      isOpen={entryMode === "upsell" || unlocked}
    >
      {inner}
    </GateWrapper>
  );
}

function EventCalendarVisual({ community }: { community: string }) {
  return (
    <div
      className="space-y-3 rounded-[var(--p-radius-lg)] border p-4"
      style={{ borderColor: "var(--p-border)", backgroundColor: "var(--p-panel)" }}
    >
      <p className="text-center text-[11px] font-bold uppercase tracking-wide" style={{ color: "var(--p-label)" }}>
        This weekend in {community}
      </p>
      <div
        className="rounded-[var(--p-radius-md)] p-4"
        style={{ backgroundColor: "var(--p-teal-soft)", borderLeft: "4px solid var(--p-teal)" }}
      >
        <p className="text-xs font-bold uppercase tracking-wide" style={{ color: "var(--p-teal)" }}>
          Event headliner
        </p>
        <p className="mt-1 text-sm font-semibold" style={{ color: "var(--p-text)" }}>
          Featured event · full description · clear call-to-action
        </p>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-[var(--p-radius-sm)] border p-2 text-center text-[10px] font-semibold"
            style={{ borderColor: "var(--p-teal)", color: "var(--p-teal)" }}
          >
            Priority
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-[var(--p-radius-sm)] border p-2 text-center text-[10px]"
            style={{ borderColor: "var(--p-border)", color: "var(--p-muted)" }}
          >
            Basic
          </div>
        ))}
      </div>
      <p className="text-center text-xs" style={{ color: "var(--p-muted)" }}>
        …30 more events
      </p>
    </div>
  );
}
