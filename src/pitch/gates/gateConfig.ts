import type { BusinessProfile, GateKey, PitchSession, PitchTrack } from "../types";

/** Gate order per pitch track — matches Agent 2 brief in SARAH_MASTER_SPEC PART 5. */
export const TRACK_GATE_SEQUENCES: Record<PitchTrack, GateKey[]> = {
  standard: ["day_news", "downtown_guide", "event_host", "golocalvoices", "alphasite"],
  professional: ["day_news", "golocalvoices", "alphasite"],
  trades: ["day_news", "alphasite"],
  venue: ["day_news", "downtown_guide", "event_host", "venue", "alphasite"],
  performer: ["performer", "day_news", "alphasite"],
  civic: ["civic", "event_host"],
};

/** Entry-platform fast-path: these gates render first, then the remainder of the track in order. */
export const ENTRY_GATE_PRIORITY: Record<string, GateKey[] | null> = {
  gec: ["event_host", "venue", "performer"],
  glv: ["golocalvoices"],
  dtg: ["downtown_guide"],
  alphasite: ["alphasite"],
  day_news: null,
  direct: null,
};

const CIVIC_ORG: GateKey[] = ["civic", "event_host"];

export function isCivicOrg(orgType: BusinessProfile["orgType"]): boolean {
  return orgType === "school" || orgType === "nonprofit" || orgType === "government";
}

export function gateIsEligible(gate: GateKey, profile: BusinessProfile): boolean {
  if (isCivicOrg(profile.orgType)) {
    return CIVIC_ORG.includes(gate);
  }
  if (gate === "civic") return false;

  switch (gate) {
    case "day_news":
      return true;
    case "downtown_guide":
      return profile.orgType === "smb" && profile.hasPhysicalLocation;
    case "event_host": {
      if (profile.orgType === "venue") return true;
      if (profile.hasEvents === "none") return false;
      return profile.orgType === "smb" || profile.orgType === "performer";
    }
    case "venue":
      return profile.orgType === "venue";
    case "performer":
      return profile.orgType === "performer";
    case "golocalvoices":
      return profile.pitchTrack === "professional" || profile.pitchTrack === "standard";
    case "alphasite":
      return true;
    default:
      return true;
  }
}

export function determineGateOrder(session: PitchSession, profile: BusinessProfile): GateKey[] {
  const track = profile.pitchTrack;
  const base = TRACK_GATE_SEQUENCES[track] ?? TRACK_GATE_SEQUENCES.standard;
  const eligible = (g: GateKey) => gateIsEligible(g, profile);
  const filtered = base.filter(eligible);

  const raw = (session.entryPlatform || "day_news").toLowerCase();
  const entryFirst = ENTRY_GATE_PRIORITY[raw] ?? null;
  if (!entryFirst?.length) return filtered;

  const entryFiltered = entryFirst.filter(eligible);
  const rest = filtered.filter((g) => !entryFirst.includes(g));
  return [...entryFiltered, ...rest];
}

export function pitchTrackFromOrgAndCategory(orgType: BusinessProfile["orgType"], category: string): PitchTrack {
  const c = category.toLowerCase();
  if (orgType === "venue") return "venue";
  if (orgType === "performer") return "performer";
  if (orgType === "school" || orgType === "nonprofit" || orgType === "government") return "civic";
  if (
    /attorney|lawyer|legal|financial\s*advisor|cpa|accountant|insurance|advisor|coach|therapist|counselor|dentist|physician|clinic/.test(
      c
    )
  ) {
    return "professional";
  }
  if (
    /plumber|electric|hvac|roof|roofer|contractor|landscap|painter|handyman|trade/.test(c)
  ) {
    return "trades";
  }
  return "standard";
}
