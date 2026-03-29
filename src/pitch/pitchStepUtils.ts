import { slotInventoryKey, type SlotRequest } from "@/pitch/api/pitchApi";
import type { PitchSession, SlotStatus } from "./types";

/** Map free-text / identify-step category to CommunitySlotInventory category slug. */
export function categorySlugForSlots(session: PitchSession): string {
  const raw = (session.businessCategory ?? "other").trim().toLowerCase();
  const map: Record<string, string> = {
    restaurant: "restaurant",
    retail: "retail",
    professional: "professional_services",
    health: "healthcare",
    entertainment: "entertainment",
    other: "other",
  };
  if (map[raw]) return map[raw];
  if (/restaurant|food/.test(raw)) return "restaurant";
  if (/retail|shop|store|salon/.test(raw)) return "retail";
  if (
    /attorney|legal|law|cpa|financial|advisor|coach|therapy|health|dentist|clinic|professional/.test(raw)
  ) {
    return "professional_services";
  }
  if (/plumber|electric|hvac|roof|contractor|landscape|handyman|trade|home/.test(raw)) {
    return "home_services";
  }
  const normalized = raw.replace(/\s*\/\s*/g, "_").replace(/\s+/g, "_").replace(/[^\w]/g, "");
  return normalized || "other";
}

const STEP_ORDER = [
  "identify", "profile_type", "community", "goals", "your_plan", "proposal",
  "auth_gate", "checkout", "done",
] as const;

export function normalizeFlowStep(last: string): (typeof STEP_ORDER)[number] | string {
  if (last === "proposal_built") return "proposal";
  if (last === "started") return "identify";
  if (last === "gates") return "your_plan";
  if (last === "confirmation") return "done";
  return last;
}

export function progressForStep(last: string): { current: number; completed: number[] } {
  const norm = normalizeFlowStep(last);
  const idx = STEP_ORDER.indexOf(norm as (typeof STEP_ORDER)[number]);
  const i = idx >= 0 ? idx : 0;
  const current = i + 1;
  const completed = i > 0 ? Array.from({ length: i }, (_, k) => k + 1) : [];
  return { current, completed };
}

export function gateSlotRequestsForSession(session: PitchSession): SlotRequest[] {
  const cid = session.communityId;
  const cat = categorySlugForSlots(session);
  const platform = "day_news";
  if (!cid) return [];
  return [
    { community_id: cid, slot_type: "influencer", category: cat, platform },
    { community_id: cid, slot_type: "headliner", category: cat, platform },
    { community_id: cid, slot_type: "event_headliner", category: "other", platform },
    { community_id: cid, slot_type: "venue_headliner", category: "other", platform },
    { community_id: cid, slot_type: "performer_headliner", category: "other", platform },
    { community_id: cid, slot_type: "expert_column", category: "other", platform },
  ];
}

function pick(
  merged: Record<string, SlotStatus>,
  communityId: string,
  slotType: string,
  category: string,
  platform = "day_news"
): SlotStatus {
  const key = slotInventoryKey(communityId, slotType, category, platform);
  return merged[key] ?? { total: 0, held: 0, available: 0, status: "open" };
}

export function slotDataForGates(
  merged: Record<string, SlotStatus>,
  session: PitchSession
): Record<string, SlotStatus> {
  const cid = session.communityId;
  const cat = categorySlugForSlots(session);
  const platform = "day_news";
  if (!cid) {
    const empty: SlotStatus = { total: 0, held: 0, available: 0, status: "open" };
    return {
      influencer: empty,
      headliner: empty,
      gec_event_headliner: empty,
      gec_venue_headliner: empty,
      gec_performer_headliner: empty,
      dtg_headliner: empty,
      glv_expert_column: empty,
    };
  }
  return {
    influencer: pick(merged, cid, "influencer", cat, platform),
    headliner: pick(merged, cid, "headliner", cat, platform),
    gec_event_headliner: pick(merged, cid, "event_headliner", "other", platform),
    gec_venue_headliner: pick(merged, cid, "venue_headliner", "other", platform),
    gec_performer_headliner: pick(merged, cid, "performer_headliner", "other", platform),
    dtg_headliner: pick(merged, cid, "headliner", cat, platform),
    glv_expert_column: pick(merged, cid, "expert_column", "other", platform),
  };
}
