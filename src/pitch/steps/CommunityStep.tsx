import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router";
import { Lock } from "lucide-react";
import type { PitchNearbyCommunityRow, PitchStepBaseProps, SlotStatus } from "../types";
import { SlotStatusBar } from "../components/SlotStatusBar";
import { fetchPitchCommunityBySlug, fetchPitchNearbyCommunities } from "@/services/pitchApi";
import { slotInventoryKey } from "@/pitch/api/pitchApi";
import { useSlotInventory } from "../hooks/useSlotInventory";
import { cn } from "@/lib/utils";

/** Slugs to offer until a public search endpoint exists; pick one to load `id` + nearby via API. */
const PRIMARY_SLUG_SUGGESTIONS: { slug: string; label: string }[] = [
  { slug: "clearwater", label: "Clearwater, FL" },
  { slug: "st-petersburg", label: "St. Petersburg, FL" },
  { slug: "tampa", label: "Tampa, FL" },
  { slug: "safety-harbor", label: "Safety Harbor, FL" },
  { slug: "dunedin", label: "Dunedin, FL" },
];

const LAUNCHING_SLUGS = new Set(["oldsmar"]);

function mapApiStatus(s: string): SlotStatus["status"] {
  if (s === "almost_full" || s === "open" || s === "full") return s;
  return "open";
}

function slotFromBatch(
  total: number,
  held: number,
  available: number,
  status: string
): SlotStatus {
  return {
    total,
    held,
    available,
    status: mapApiStatus(status),
  };
}

export function CommunityStep({ session, onNext, onBack, onLogEvent, onSarahMessage }: PitchStepBaseProps) {
  const { communitySlug: routeSlug } = useParams<{ communitySlug?: string }>();
  const { batchFetch } = useSlotInventory();
  const businessName = session.businessName ?? "your business";
  const category = session.businessCategory ?? "Restaurant";

  const [slug, setSlug] = useState<string>(routeSlug ?? "clearwater");
  const [primary, setPrimary] = useState<{
    id: number;
    name: string;
    state?: string | null;
    county?: string | null;
  } | null>(null);
  const [primarySlot, setPrimarySlot] = useState<SlotStatus | null>(null);
  const [nearbyRows, setNearbyRows] = useState<PitchNearbyCommunityRow[]>([]);
  const [selectedNearby, setSelectedNearby] = useState<Set<number>>(new Set());
  const [showMore, setShowMore] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    onLogEvent("step_reached", { step: "community" });
  }, [onLogEvent]);

  useEffect(() => {
    if (routeSlug) setSlug(routeSlug);
  }, [routeSlug]);

  const speakSlots = useCallback(
    (slot: SlotStatus, comm: string) => {
      if (slot.status === "open") {
        onSarahMessage?.(
          `Good timing — there are ${slot.available} spots available in ${category} in ${comm}.`
        );
      } else if (slot.status === "almost_full") {
        onSarahMessage?.(
          `Worth noting — there's only ${slot.available} spot left in ${category} in ${comm}. Once it's gone, it's gone.`
        );
      } else {
        onSarahMessage?.(
          `Your category is full in ${comm} for the Influencer position. There's still a Section Sponsor option — I'll show you that.`
        );
      }
    },
    [category, onSarahMessage]
  );

  const loadPrimary = useCallback(async () => {
    setLoadError(null);
    try {
      const comm = await fetchPitchCommunityBySlug(slug);
      setPrimary({ id: comm.id, name: comm.name, state: comm.state, county: comm.county });

      const primaryBatch = await batchFetch([
        { community_id: comm.id, slot_type: "influencer", category, platform: "day_news" },
      ]);
      const pk = slotInventoryKey(comm.id, "influencer", category, "day_news");
      const primarySlot = primaryBatch[pk];
      const slot = primarySlot
        ? slotFromBatch(primarySlot.total, primarySlot.held, primarySlot.available, primarySlot.status)
        : { total: 6, held: 3, available: 3, status: "open" as const };

      setPrimarySlot(slot);
      speakSlots(slot, comm.name);

      const nearbyPack = await fetchPitchNearbyCommunities(String(comm.id), category);
      const near = nearbyPack.nearby_communities ?? [];
      const batchKeys = near.map((n) => ({
        community_id: n.id,
        slot_type: "influencer",
        category,
        platform: "day_news" as const,
      }));
      let nearBatch: Record<string, SlotStatus> = {};
      if (batchKeys.length) {
        nearBatch = await batchFetch(batchKeys);
      }
      const byId = new Map<number, SlotStatus>();
      for (const n of near) {
        const k = slotInventoryKey(n.id, "influencer", category, "day_news");
        const st = nearBatch[k];
        if (st) byId.set(n.id, st);
      }

      const rows: PitchNearbyCommunityRow[] = near.map((n) => {
        const slugLaunch = LAUNCHING_SLUGS.has(n.slug);
        if (slugLaunch) {
          return {
            id: n.id,
            name: n.name,
            slug: n.slug,
            state: n.state,
            county: n.county,
            slotStatus: { total: 0, held: 0, available: 0, status: "full" },
            rowStatus: "launching_q2",
            launchingNote: "Reserve your spot",
          };
        }
        const stHit = byId.get(n.id);
        const st = stHit
          ? slotFromBatch(stHit.total, stHit.held, stHit.available, stHit.status)
          : { total: 5, held: 2, available: 3, status: "open" as const };

        let rowStatus: PitchNearbyCommunityRow["rowStatus"] = "open";
        if (st.status === "almost_full") rowStatus = "almost_full";
        else if (st.status === "full") rowStatus = "full";

        return {
          id: n.id,
          name: n.name,
          slug: n.slug,
          state: n.state,
          county: n.county,
          slotStatus: st,
          rowStatus,
        };
      });

      rows.sort((a, b) => {
        const order = { almost_full: 0, open: 1, full: 2, launching_q2: 3 };
        return order[a.rowStatus] - order[b.rowStatus];
      });

      setNearbyRows(rows);
      setSelectedNearby(new Set());
    } catch {
      setLoadError("We couldn’t load communities right now. Check your connection and try again.");
      setPrimary(null);
      setPrimarySlot(null);
      setNearbyRows([]);
    }
  }, [category, slug, speakSlots, batchFetch]);

  useEffect(() => {
    void loadPrimary();
  }, [loadPrimary]);

  const visibleNearby = showMore ? nearbyRows : nearbyRows.slice(0, 6);

  const selectedCount = 1 + selectedNearby.size;

  function toggleNearby(id: number) {
    setSelectedNearby((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function submit() {
    if (!primary || !primarySlot) return;
    const territory = [String(primary.id), ...[...selectedNearby].map(String)];
    onLogEvent("step_completed", { step: "community", territory });
    onNext({
      communityId: String(primary.id),
      primaryCommunityName: primary.name,
      primaryCommunityState: primary.state ?? undefined,
      countyName: primary.county ?? undefined,
      territorySelection: territory,
    });
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold md:text-4xl" style={{ color: "var(--p-text)" }}>
          Where do your customers live?
        </h1>
        <p className="mt-3 text-base" style={{ color: "var(--p-muted)" }}>
          Select your primary community for {businessName}.
        </p>
      </div>

      <p className="text-sm leading-relaxed" style={{ color: "var(--p-muted)" }}>
        Positions are limited per category per community — whoever holds one, holds it.
      </p>

      <div className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--p-label)" }}>
          Your primary community
        </p>
        <select
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className="w-full rounded-[var(--p-radius-md)] border px-3 py-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--p-teal)]"
          style={{ borderColor: "var(--p-border)", backgroundColor: "var(--p-card)", color: "var(--p-text)" }}
          aria-label="Primary community"
        >
          {PRIMARY_SLUG_SUGGESTIONS.map((s) => (
            <option key={s.slug} value={s.slug}>
              {s.label}
            </option>
          ))}
        </select>
        {loadError ? (
          <p className="text-sm" style={{ color: "var(--p-red)" }}>
            {loadError}
          </p>
        ) : null}
      </div>

      {primary && primarySlot ? (
        <div
          className="rounded-[var(--p-radius-lg)] border-2 p-4"
          style={{ borderColor: "var(--p-teal)", backgroundColor: "var(--p-card)" }}
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-lg font-bold" style={{ color: "var(--p-text)" }}>
                {primary.name}
                {primary.state ? `, ${primary.state}` : ""}
              </p>
              <p className="mt-1 flex items-center gap-1 text-xs font-medium" style={{ color: "var(--p-muted)" }}>
                <Lock className="h-3 w-3" aria-hidden />
                Home community · locked
              </p>
            </div>
          </div>
          <div className="mt-4">
            <CommunityStepSlotSummary category={category} community={primary.name} slot={primarySlot} />
          </div>
        </div>
      ) : null}

      {nearbyRows.length > 0 ? (
        <div className="space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--p-label)" }}>
            Nearby communities
          </p>
          <ul className="space-y-2">
            {visibleNearby.map((row) => {
              const checked = selectedNearby.has(row.id);
              const disabled = row.rowStatus === "launching_q2";
              return (
                <li
                  key={row.id}
                  className={cn(
                    "rounded-[var(--p-radius-md)] border p-3",
                    disabled && "opacity-70"
                  )}
                  style={{ borderColor: "var(--p-border)", backgroundColor: "var(--p-card)" }}
                >
                  <label className="flex cursor-pointer gap-3">
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4 rounded border-[var(--p-border-light)]"
                      checked={checked}
                      disabled={disabled}
                      onChange={() => toggleNearby(row.id)}
                      aria-label={`Include ${row.name}`}
                    />
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold" style={{ color: "var(--p-text)" }}>
                          {row.name}
                        </span>
                        {row.rowStatus === "full" ? (
                          <span
                            className="rounded-[var(--p-radius-pill)] px-2 py-0.5 text-[10px] font-bold uppercase"
                            style={{ backgroundColor: "var(--p-amber-soft)", color: "var(--p-amber)" }}
                          >
                            Full in {category}
                          </span>
                        ) : null}
                        {row.rowStatus === "almost_full" ? (
                          <span
                            className="rounded-[var(--p-radius-pill)] px-2 py-0.5 text-[10px] font-bold uppercase"
                            style={{ backgroundColor: "var(--p-amber-soft)", color: "var(--p-amber)" }}
                          >
                            Almost full
                          </span>
                        ) : null}
                        {row.rowStatus === "open" ? (
                          <span
                            className="rounded-[var(--p-radius-pill)] px-2 py-0.5 text-[10px] font-bold uppercase"
                            style={{ backgroundColor: "var(--p-green-soft)", color: "var(--p-green)" }}
                          >
                            Open
                          </span>
                        ) : null}
                        {row.rowStatus === "launching_q2" ? (
                          <span
                            className="rounded-[var(--p-radius-pill)] px-2 py-0.5 text-[10px] font-bold uppercase"
                            style={{ backgroundColor: "var(--p-border)", color: "var(--p-muted)" }}
                          >
                            {row.launchingNote ?? "Reserve your spot"}
                          </span>
                        ) : null}
                      </div>
                      {row.rowStatus === "full" ? (
                        <p className="text-xs" style={{ color: "var(--p-muted)" }}>
                          Section Sponsor available
                        </p>
                      ) : null}
                      <CommunityStepSlotSummary category={category} community={row.name} slot={row.slotStatus} compact />
                    </div>
                  </label>
                </li>
              );
            })}
          </ul>
          {nearbyRows.length > 6 ? (
            <button
              type="button"
              onClick={() => setShowMore((v) => !v)}
              className="text-sm font-semibold underline-offset-2 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--p-teal)] rounded"
              style={{ color: "var(--p-teal)" }}
            >
              {showMore ? "Show fewer" : `Show more communities in ${primary?.county ?? "the county"}`}
            </button>
          ) : null}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-3 border-t pt-6" style={{ borderColor: "var(--p-border)" }}>
        <button
          type="button"
          onClick={onBack}
          className="rounded-[var(--p-radius-pill)] border px-4 py-2 text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--p-teal)]"
          style={{ borderColor: "var(--p-border-light)", color: "var(--p-text)" }}
        >
          Back
        </button>
        {primary && primarySlot ? (
          <button
            type="button"
            onClick={submit}
            className="rounded-[var(--p-radius-pill)] px-5 py-2 text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--p-teal)]"
            style={{ backgroundColor: "var(--p-teal)", color: "var(--p-bg)" }}
          >
            Continue with {selectedCount} {selectedCount === 1 ? "community" : "communities"} →
          </button>
        ) : null}
      </div>
    </div>
  );
}

function CommunityStepSlotSummary({
  category,
  community,
  slot,
  compact,
}: {
  category: string;
  community: string;
  slot: SlotStatus;
  compact?: boolean;
}) {
  return (
    <SlotStatusBar
      total={slot.total}
      held={slot.held}
      category={category}
      community={community}
      heldBy={slot.heldBy}
      size={compact ? "sm" : "md"}
    />
  );
}
