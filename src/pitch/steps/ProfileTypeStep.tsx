import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import type { OrgType, PitchStepBaseProps } from "../types";
import { pitchTrackFromOrgAndCategory } from "../gates/gateConfig";
import { cn } from "@/lib/utils";

type EventsFreq = "regularly" | "occasionally" | "none";

const CARDS: {
  orgType: OrgType;
  icon: string;
  title: string;
  subtitle: string;
}[] = [
  {
    orgType: "smb",
    icon: "🏪",
    title: "Local Business",
    subtitle: "Restaurant, retail, salon, shop, or service",
  },
  {
    orgType: "venue",
    icon: "🎪",
    title: "Event Venue",
    subtitle: "Space available for events, parties, or bookings",
  },
  {
    orgType: "performer",
    icon: "🎵",
    title: "Performer / Entertainer",
    subtitle: "Artist, DJ, band, comedian, speaker",
  },
  {
    orgType: "school",
    icon: "🎓",
    title: "School / Educational Org",
    subtitle: "K-12, university, tutoring, classes",
  },
  {
    orgType: "nonprofit",
    icon: "🤝",
    title: "Non-Profit / Civic Org",
    subtitle: "501(c), charity, community group",
  },
  {
    orgType: "government",
    icon: "🏛️",
    title: "Government / Municipality",
    subtitle: "City office, department, public service",
  },
];

function confirmationForOrg(org: OrgType): string {
  switch (org) {
    case "smb":
      return "Knowing you’re a local business helps me skip what doesn’t apply and focus on listings, traffic, and how you show up when people search.";
    case "venue":
      return "Perfect — for venues we focus on how hosts find your space and how events get on the calendar.";
    case "performer":
      return "Got it — I’ll cover how venues discover you and how your dates get seen.";
    case "school":
      return "Thanks — schools have a different track: community communication first, not a retail-style pitch.";
    case "nonprofit":
      return "Understood — nonprofits get civic framing: participation and reach, not pushy promotion.";
    case "government":
      return "Thanks — municipalities get the same civic track built around serving residents clearly.";
    default:
      return "Got it — I’ll tailor the rest from here.";
  }
}

const EVENT_CHIPS: { value: EventsFreq; label: string }[] = [
  { value: "regularly", label: "Yes, regularly" },
  { value: "occasionally", label: "Occasionally" },
  { value: "none", label: "Not at all" },
];

export function ProfileTypeStep({ session, onNext, onBack, onLogEvent, onSarahMessage }: PitchStepBaseProps) {
  const businessName = session.businessName ?? "your business";
  const category = session.businessCategory ?? "";

  const [orgType, setOrgType] = useState<OrgType | null>(session.orgType ?? null);
  const [events, setEvents] = useState<EventsFreq | null>(session.hasEvents ?? null);

  useEffect(() => {
    onLogEvent("step_reached", { step: "profile_type" });
  }, [onLogEvent]);

  useEffect(() => {
    if (orgType) {
      onSarahMessage?.(`Got it. ${confirmationForOrg(orgType)}`);
    }
  }, [orgType, onSarahMessage]);

  const canContinue = orgType && events !== null;

  const pitchTrack = useMemo(() => {
    if (!orgType) return undefined;
    return pitchTrackFromOrgAndCategory(orgType, category);
  }, [orgType, category]);

  function submit() {
    if (!orgType || events === null || !pitchTrack) return;
    onLogEvent("step_completed", { step: "profile_type", orgType, hasEvents: events, pitchTrack });
    const hasPhysical = orgType === "smb" || orgType === "venue";
    onNext({
      orgType,
      hasEvents: events,
      pitchTrack,
      hasPhysicalLocation: hasPhysical,
    });
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold md:text-4xl" style={{ color: "var(--p-text)" }}>
          What best describes {businessName}?
        </h1>
        <p className="mt-3 text-base" style={{ color: "var(--p-muted)" }}>
          This helps me build the right plan for you.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {CARDS.map((card) => {
          const selected = orgType === card.orgType;
          return (
            <button
              key={card.orgType}
              type="button"
              onClick={() => setOrgType(card.orgType)}
              className={cn(
                "relative flex flex-col items-start gap-2 rounded-[var(--p-radius-lg)] border-2 p-4 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--p-teal)]",
                selected ? "border-[var(--p-teal)]" : "border-[var(--p-border)]"
              )}
              style={{
                backgroundColor: selected ? "var(--p-teal-soft)" : "var(--p-card)",
              }}
              aria-pressed={selected}
            >
              {selected ? (
                <span
                  className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full"
                  style={{ backgroundColor: "var(--p-teal)", color: "var(--p-bg)" }}
                  aria-hidden
                >
                  <Check className="h-3.5 w-3.5" strokeWidth={3} />
                </span>
              ) : null}
              <span className="text-3xl" aria-hidden>
                {card.icon}
              </span>
              <span className="text-base font-bold" style={{ color: "var(--p-text)" }}>
                {card.title}
              </span>
              <span className="text-[13px] leading-snug" style={{ color: "var(--p-muted)" }}>
                {card.subtitle}
              </span>
            </button>
          );
        })}
      </div>

      <AnimatePresence initial={false}>
        {orgType ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.22 }}
            className="space-y-3"
          >
            <p className="text-sm font-semibold" style={{ color: "var(--p-text)" }}>
              Does {businessName} host or promote events?
            </p>
            <div className="flex flex-wrap gap-2">
              {EVENT_CHIPS.map((c) => {
                const active = events === c.value;
                return (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setEvents(c.value)}
                    className={cn(
                      "rounded-[var(--p-radius-pill)] border px-4 py-2 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--p-teal)]",
                      active ? "border-transparent" : "border-[var(--p-border-light)]"
                    )}
                    style={
                      active
                        ? { backgroundColor: "var(--p-teal)", color: "var(--p-bg)" }
                        : { color: "var(--p-text)", backgroundColor: "var(--p-card)" }
                    }
                  >
                    {c.label}
                  </button>
                );
              })}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="flex flex-wrap items-center gap-3 border-t pt-6" style={{ borderColor: "var(--p-border)" }}>
        <button
          type="button"
          onClick={onBack}
          className="rounded-[var(--p-radius-pill)] border px-4 py-2 text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--p-teal)]"
          style={{ borderColor: "var(--p-border-light)", color: "var(--p-text)" }}
        >
          Back
        </button>
        {canContinue ? (
          <button
            type="button"
            onClick={submit}
            className="rounded-[var(--p-radius-pill)] px-5 py-2 text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--p-teal)]"
            style={{ backgroundColor: "var(--p-teal)", color: "var(--p-bg)" }}
          >
            Continue →
          </button>
        ) : null}
      </div>
    </div>
  );
}
