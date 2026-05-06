import { useCallback, useEffect, useMemo, useRef, useState, type ComponentType } from "react";
import type { AcceptedProduct, BusinessProfile, EntryMode, GateKey, PitchSession, SlotStatus, UpsellRecommendation } from "../types";
import { determineGateOrder, determineUpsellGateOrder } from "./gateConfig";
import { FastPathNav } from "../components/FastPathNav";
import { DayNewsGate } from "./DayNewsGate";
import { DowntownGuideGate } from "./DowntownGuideGate";
import { EventHostGate } from "./EventHostGate";
import { VenueGate } from "./VenueGate";
import { PerformerGate } from "./PerformerGate";
import { GoLocalVoicesGate } from "./GoLocalVoicesGate";
import { AlphaSiteGate } from "./AlphaSiteGate";
import { CivicGate } from "./CivicGate";

const GATE_LABELS: Record<GateKey, { label: string; icon: string }> = {
  day_news: { label: "Day.News", icon: "◆" },
  downtown_guide: { label: "Downtown Guide", icon: "◆" },
  event_host: { label: "Events", icon: "◆" },
  venue: { label: "Venues", icon: "◆" },
  performer: { label: "Performers", icon: "◆" },
  golocalvoices: { label: "GoLocalVoices", icon: "◆" },
  alphasite: { label: "AlphaSite", icon: "◆" },
  civic: { label: "Civic", icon: "◆" },
};

const GATE_COMPONENTS: Record<GateKey, ComponentType<GateRenderProps>> = {
  day_news: DayNewsGate,
  downtown_guide: DowntownGuideGate,
  event_host: EventHostGate,
  venue: VenueGate,
  performer: PerformerGate,
  golocalvoices: GoLocalVoicesGate,
  alphasite: AlphaSiteGate,
  civic: CivicGate,
};

/** Props passed into each gate (same as PitchGateBaseProps). */
type GateRenderProps = {
  session: PitchSession;
  profile: BusinessProfile;
  slotData: Record<string, SlotStatus>;
  entryMode: EntryMode;
  onProductAdd: (product: AcceptedProduct) => void;
  onProductSkip: (productId: string) => void;
  onProductDefer?: (productId: string) => void;
  onGateComplete: () => void;
  onGateDefer: () => void;
  onLogEvent: (type: string, payload?: Record<string, unknown>) => void;
  variant?: "standalone" | "embedded";
};

export interface GateSequencerProps {
  session: PitchSession;
  profile: BusinessProfile;
  slotData: Record<string, SlotStatus>;
  entryMode: EntryMode;
  onGateComplete: (gate: GateKey, products: AcceptedProduct[]) => void;
  onGateDefer: (gate: GateKey, reason: string) => void;
  onAllGatesComplete: () => void;
  onLogEvent: (type: string, payload?: Record<string, unknown>) => void;
  /** Optional: bubble products into the live session as they are accepted. */
  onSessionProductAdd?: (product: AcceptedProduct) => void;
  onProgressSubLabel?: (label: string) => void;
  /** After profile/discovery — enables fast-path strip. */
  profileComplete?: boolean;
  /** Jump to a gate when `?gate=` matches (e.g. events → event_host). */
  fastPathGateKey?: GateKey | string;
  /** Products the customer already owns (for upsell filtering) */
  ownedProducts?: string[];
  /** AI recommendations for gate ordering in upsell mode */
  recommendations?: UpsellRecommendation[];
}

export function GateSequencer({
  session,
  profile,
  slotData,
  entryMode,
  onGateComplete,
  onGateDefer,
  onAllGatesComplete,
  onLogEvent,
  onSessionProductAdd,
  onProgressSubLabel,
  profileComplete = true,
  fastPathGateKey,
  ownedProducts,
  recommendations,
}: GateSequencerProps) {
  const order = useMemo(() => {
    if (entryMode === "upsell" && ownedProducts?.length && recommendations?.length) {
      return determineUpsellGateOrder(session, profile, ownedProducts, recommendations);
    }
    return determineGateOrder(session, profile);
  }, [session, profile, entryMode, ownedProducts, recommendations]);
  const orderKey = order.join("|");
  const [index, setIndex] = useState(0);
  const gateBufferRef = useRef<AcceptedProduct[]>([]);

  useEffect(() => {
    setIndex(0);
    gateBufferRef.current = [];
  }, [orderKey]);

  const safeIndex = order.length === 0 ? 0 : Math.min(index, order.length - 1);
  const currentGate = order[safeIndex] ?? null;
  const GateCmp = currentGate ? GATE_COMPONENTS[currentGate] : null;

  useEffect(() => {
    gateBufferRef.current = [];
  }, [currentGate]);

  useEffect(() => {
    if (currentGate) {
      onProgressSubLabel?.(GATE_LABELS[currentGate].label);
      onLogEvent("gate_offered", { gate: currentGate });
    }
  }, [currentGate, onLogEvent, onProgressSubLabel]);

  const fastPathDoneRef = useRef(false);
  useEffect(() => {
    fastPathDoneRef.current = false;
  }, [orderKey]);

  useEffect(() => {
    if (!fastPathGateKey || order.length === 0 || fastPathDoneRef.current) return;
    const key = fastPathGateKey as GateKey;
    const i = order.indexOf(key);
    if (i >= 0) {
      fastPathDoneRef.current = true;
      gateBufferRef.current = [];
      setIndex(i);
      onLogEvent("gate_fast_path", { gate: key });
    }
  }, [fastPathGateKey, onLogEvent, order]);

  const advance = useCallback(() => {
    if (!currentGate) {
      onAllGatesComplete();
      return;
    }
    const products = [...gateBufferRef.current];
    onGateComplete(currentGate, products);
    gateBufferRef.current = [];
    if (safeIndex >= order.length - 1) {
      onAllGatesComplete();
    } else {
      setIndex((i) => i + 1);
    }
  }, [currentGate, onAllGatesComplete, onGateComplete, order.length, safeIndex]);

  const deferGate = useCallback(
    (reason: string) => {
      if (currentGate) onGateDefer(currentGate, reason);
      gateBufferRef.current = [];
      if (safeIndex >= order.length - 1) {
        onAllGatesComplete();
      } else {
        setIndex((i) => i + 1);
      }
    },
    [currentGate, onAllGatesComplete, onGateDefer, order.length, safeIndex]
  );

  const onProductAdd = useCallback(
    (p: AcceptedProduct) => {
      gateBufferRef.current.push(p);
      onSessionProductAdd?.(p);
    },
    [onSessionProductAdd]
  );

  const fastPathItems = useMemo(
    () => order.map((k) => ({ key: k, ...GATE_LABELS[k] })),
    [order]
  );

  const jumpTo = useCallback(
    (key: string) => {
      const i = order.indexOf(key as GateKey);
      if (i >= 0) {
        gateBufferRef.current = [];
        setIndex(i);
        onLogEvent("gate_fast_path", { gate: key });
      }
    },
    [order, onLogEvent]
  );

  if (!currentGate || !GateCmp || order.length === 0) {
    return (
      <p className="text-sm" style={{ color: "var(--p-muted)" }}>
        No gates available for this profile.
      </p>
    );
  }

  return (
    <div className="space-y-0">
      {profileComplete ? (
        <FastPathNav availableGates={fastPathItems} onSelect={jumpTo} onCollapse={() => undefined} />
      ) : null}
      <div className="pt-6">
        <GateCmp
          session={session}
          profile={profile}
          slotData={slotData}
          entryMode={entryMode}
          onProductAdd={onProductAdd}
          onProductSkip={() => undefined}
          onProductDefer={() => undefined}
          onGateComplete={advance}
          onGateDefer={() => deferGate("user_deferred")}
          onLogEvent={onLogEvent}
        />
      </div>
    </div>
  );
}

/** Build a display profile when only `PitchSession` is available. */
export function businessProfileFromSession(session: PitchSession): BusinessProfile {
  const cat = session.businessCategory ?? "Local business";
  return {
    businessName: session.businessName ?? "Your business",
    category: cat,
    communityName: session.primaryCommunityName ?? "Your community",
    county: session.countyName ?? "Your county",
    pitchTrack: session.pitchTrack ?? "standard",
    orgType: session.orgType ?? "smb",
    hasPhysicalLocation: session.hasPhysicalLocation ?? true,
    hasEvents: session.hasEvents ?? "occasionally",
    expertiseLabel: "trusted advisor",
    contactFirstName: "Alex",
    serviceSearchTerm: cat,
    categorySuggestsPhoneIntake: /restaurant|retail|salon|shop|cafe|brew|hotel/i.test(cat),
  };
}
