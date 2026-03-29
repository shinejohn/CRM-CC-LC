import { apiClient } from "@/services/api";
import type {
  PitchSession,
  PublicBusinessSearchHit,
  SlotStatus,
  SlotStatusLevel,
} from "@/pitch/types";

/** Laravel returns models under `data` with snake_case keys. */
type JsonObject = Record<string, unknown>;

function pitchApiPath(path: string): string {
  const base = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
  const needsV1 = !base.endsWith("v1");
  const p = path.startsWith("/") ? path : `/${path}`;
  return needsV1 ? `/v1/pitch${p}` : `/pitch${p}`;
}

export interface EntryContext {
  community_id: number;
  entry_platform: string;
  entry_context?: string;
  org_type?: string;
  pitch_track?: string;
  status?: string;
  last_step?: string;
}

export interface PitchCommunity {
  id: number;
  name: string;
  slug: string;
  state?: string | null;
  county?: string | null;
  [key: string]: unknown;
}

export interface CommunityWithSlots {
  community: PitchCommunity;
  slots: unknown[];
  nearby_communities: PitchCommunity[];
}

/** Batch slot lookup input — matches Laravel `slots.*` validation. */
export interface SlotRequest {
  community_id: number | string;
  slot_type: string;
  category: string;
  platform?: string;
}

interface SlotBatchRow {
  community_id: number | string;
  slot_type: string;
  category: string;
  platform: string;
  total_slots: number;
  held_slots: number;
  available_slots: number;
  status: string;
}

export interface ClaimBusinessPayload {
  community_id: number;
}

export interface ClaimBusinessResult {
  smb: JsonObject;
  business_directory: PublicBusinessSearchHit;
}

export interface CreateBusinessPayload {
  community_id?: number | null;
  business_name: string;
  city?: string | null;
  state?: string | null;
  category?: string | null;
  source?: string;
  metadata?: Record<string, unknown>;
}

export interface ProposalLineWarning {
  type?: string;
  message?: string;
  [key: string]: unknown;
}

export interface Proposal {
  session: PitchSession;
  warnings: ProposalLineWarning[];
}

function mapSlotStatusLevel(s: string): SlotStatusLevel {
  if (s === "almost_full" || s === "open" || s === "full") return s;
  return "open";
}

export function slotStatusFromBatchRow(row: SlotBatchRow): SlotStatus {
  return {
    total: row.total_slots,
    held: row.held_slots,
    available: row.available_slots,
    status: mapSlotStatusLevel(row.status),
  };
}

/** Composite key for batch map — must match useSlotInventory. */
export function slotInventoryKey(
  communityId: string | number,
  slotType: string,
  category: string,
  platform = "day_news"
): string {
  return `${communityId}:${platform}:${slotType}:${category}`;
}

export function parsePitchSession(raw: JsonObject): PitchSession {
  const community = raw.community as JsonObject | undefined;
  const smb = raw.smb as JsonObject | undefined;

  return {
    id: String(raw.id ?? ""),
    smbId:
      raw.smb_id !== undefined && raw.smb_id !== null
        ? String(raw.smb_id)
        : smb?.id !== undefined
          ? String(smb.id)
          : undefined,
    customerId:
      raw.customer_id !== undefined && raw.customer_id !== null ? String(raw.customer_id) : undefined,
    communityId: String(raw.community_id ?? ""),
    entryPlatform: String(raw.entry_platform ?? "day_news"),
    orgType: (raw.org_type as PitchSession["orgType"]) ?? undefined,
    pitchTrack: (raw.pitch_track as PitchSession["pitchTrack"]) ?? undefined,
    status: String(raw.status ?? ""),
    lastStep: String(raw.last_step ?? "identify"),
    discoveryAnswers: raw.discovery_answers as PitchSession["discoveryAnswers"] | undefined,
    territorySelection: raw.territory_selection as string[] | undefined,
    gatesOffered: raw.gates_offered as PitchSession["gatesOffered"] | undefined,
    gatesCompleted: raw.gates_completed as PitchSession["gatesCompleted"] | undefined,
    gatesDeferred: raw.gates_deferred as PitchSession["gatesDeferred"] | undefined,
    productsAccepted: raw.products_accepted as PitchSession["productsAccepted"] | undefined,
    productsDeclined: raw.products_declined as PitchSession["productsDeclined"] | undefined,
    proposalId: raw.proposal_id ? String(raw.proposal_id) : undefined,
    businessName: raw.business_name !== undefined ? String(raw.business_name) : smb?.business_name ? String(smb.business_name) : undefined,
    businessCategory:
      raw.business_category !== undefined
        ? String(raw.business_category)
        : smb?.category
          ? String(smb.category)
          : undefined,
    primaryCommunityName: raw.primary_community_name
      ? String(raw.primary_community_name)
      : community?.name
        ? String(community.name)
        : undefined,
    primaryCommunityState: raw.primary_community_state
      ? String(raw.primary_community_state)
      : community?.state
        ? String(community.state)
        : undefined,
    countyName: raw.county_name ? String(raw.county_name) : community?.county ? String(community.county) : undefined,
    hasPhysicalLocation:
      typeof raw.has_physical_location === "boolean"
        ? raw.has_physical_location
        : undefined,
    hasEvents: raw.has_events as PitchSession["hasEvents"] | undefined,
  };
}

function sessionToPatchPayload(data: Partial<PitchSession>): JsonObject {
  const out: JsonObject = {};
  if (data.status !== undefined) out.status = data.status;
  if (data.lastStep !== undefined) out.last_step = data.lastStep;
  if (data.orgType !== undefined) out.org_type = data.orgType;
  if (data.pitchTrack !== undefined) out.pitch_track = data.pitchTrack;
  if (data.discoveryAnswers !== undefined) out.discovery_answers = data.discoveryAnswers;
  if (data.territorySelection !== undefined) out.territory_selection = data.territorySelection;
  if (data.gatesOffered !== undefined) out.gates_offered = data.gatesOffered;
  if (data.gatesCompleted !== undefined) out.gates_completed = data.gatesCompleted;
  if (data.gatesDeferred !== undefined) out.gates_deferred = data.gatesDeferred;
  if (data.productsAccepted !== undefined) out.products_accepted = data.productsAccepted;
  if (data.productsDeclined !== undefined) out.products_declined = data.productsDeclined;
  if (data.proposalId !== undefined) out.proposal_id = data.proposalId;
  if (data.smbId !== undefined) out.smb_id = Number(data.smbId);
  if (data.customerId !== undefined) out.customer_id = data.customerId;
  if (data.communityId !== undefined) out.community_id = Number(data.communityId);
  return out;
}

function mapDirectoryHit(row: JsonObject): PublicBusinessSearchHit {
  return {
    id: String(row.id ?? ""),
    business_name: String(row.business_name ?? ""),
    city: row.city !== undefined && row.city !== null ? String(row.city) : null,
    state: row.state !== undefined && row.state !== null ? String(row.state) : null,
    category: row.category !== undefined && row.category !== null ? String(row.category) : null,
    community_id:
      row.community_id !== undefined && row.community_id !== null ? String(row.community_id) : null,
  };
}

export async function createSession(entryContext: EntryContext): Promise<PitchSession> {
  const res = await apiClient.post<{ data: JsonObject }>(pitchApiPath("/sessions"), entryContext);
  return parsePitchSession(res.data.data);
}

export async function getSession(id: string): Promise<PitchSession> {
  const res = await apiClient.get<{ data: JsonObject }>(pitchApiPath(`/sessions/${encodeURIComponent(id)}`));
  return parsePitchSession(res.data.data);
}

export async function updateSession(id: string, data: Partial<PitchSession>): Promise<PitchSession> {
  const res = await apiClient.patch<{ data: JsonObject }>(
    pitchApiPath(`/sessions/${encodeURIComponent(id)}`),
    sessionToPatchPayload(data)
  );
  return parsePitchSession(res.data.data);
}

/**
 * Fire-and-forget safe: callers should use `.catch(...)` and never block UI.
 * Backend expects `event_type` and optional `payload` (array validated as array).
 */
export async function logEvent(sessionId: string, type: string, payload: unknown): Promise<void> {
  const body: JsonObject = {
    event_type: type,
    payload: payload === undefined || payload === null ? {} : (payload as JsonObject),
  };
  await apiClient.post(pitchApiPath(`/sessions/${encodeURIComponent(sessionId)}/event`), body);
}

export async function searchBusinesses(query: string, communityId?: string): Promise<PublicBusinessSearchHit[]> {
  const q = query.trim();
  if (!q) return [];
  const params: Record<string, string> = { q };
  if (communityId) params.community_id = communityId;
  const res = await apiClient.get<{ data: JsonObject[] }>(pitchApiPath("/businesses/search"), { params });
  return (res.data.data ?? []).map((row) => mapDirectoryHit(row));
}

export async function claimBusiness(id: string, data: ClaimBusinessPayload): Promise<ClaimBusinessResult> {
  const res = await apiClient.post<{ data: ClaimBusinessResult }>(
    pitchApiPath(`/businesses/${encodeURIComponent(id)}/claim`),
    data
  );
  const pack = res.data.data;
  const dir = pack.business_directory as unknown as JsonObject;
  return {
    smb: pack.smb,
    business_directory: mapDirectoryHit(dir),
  };
}

export async function createBusiness(data: CreateBusinessPayload): Promise<PublicBusinessSearchHit> {
  const res = await apiClient.post<{ data: JsonObject }>(pitchApiPath("/businesses"), data);
  return mapDirectoryHit(res.data.data);
}

export async function getNearbyCommunities(communityId: string, category: string): Promise<CommunityWithSlots> {
  const res = await apiClient.get<{ data: CommunityWithSlots }>(pitchApiPath("/communities/nearby"), {
    params: { community_id: communityId, category },
  });
  return res.data.data;
}

export async function getSlotStatus(
  communityId: string,
  slotType: string,
  category: string,
  platform = "day_news"
): Promise<SlotStatus> {
  const params = { platform };
  const path = `/slots/${encodeURIComponent(communityId)}/${encodeURIComponent(slotType)}/${encodeURIComponent(category)}`;
  const res = await apiClient.get<{ data: SlotBatchRow }>(pitchApiPath(path), { params });
  const row = res.data.data;
  return slotStatusFromBatchRow(row);
}

export async function getSlotStatusBatch(requests: SlotRequest[]): Promise<Record<string, SlotStatus>> {
  if (!requests.length) return {};
  const res = await apiClient.post<{ data: SlotBatchRow[] }>(pitchApiPath("/slots/batch"), { slots: requests });
  const rows = res.data.data ?? [];
  const out: Record<string, SlotStatus> = {};
  for (const row of rows) {
    out[slotInventoryKey(row.community_id, row.slot_type, row.category, row.platform)] = slotStatusFromBatchRow(row);
  }
  return out;
}

export async function buildProposal(
  sessionId: string,
  body: {
    products: string[];
    business_context?: Record<string, unknown>;
    proposal_id?: string;
    proposal_value?: number;
    total_mrr?: number;
  }
): Promise<Proposal> {
  const res = await apiClient.post<{ data: { session: JsonObject; warnings: ProposalLineWarning[] } }>(
    pitchApiPath(`/sessions/${encodeURIComponent(sessionId)}/proposal`),
    body
  );
  return {
    session: parsePitchSession(res.data.data.session),
    warnings: res.data.data.warnings ?? [],
  };
}

export async function resolveCommunitySlug(slug: string): Promise<PitchCommunity> {
  const res = await apiClient.get<{ data: JsonObject }>(pitchApiPath(`/communities/${encodeURIComponent(slug)}`));
  const d = res.data.data;
  return {
    id: Number(d.id),
    name: String(d.name ?? ""),
    slug: String(d.slug ?? slug),
    state: d.state !== undefined && d.state !== null ? String(d.state) : null,
    county: d.county !== undefined && d.county !== null ? String(d.county) : null,
  };
}

/* ─── Checkout / Payment ──────────────────────────────────────────────── */

export async function createCheckoutIntent(sessionId: string, data: {
  selected_products: string[];
  total_amount: number;
  billing_cycle: 'monthly' | 'annual';
}): Promise<{ client_secret: string; payment_intent_id: string }> {
  const res = await apiClient.post<{ data: { client_secret: string; payment_intent_id: string } }>(
    pitchApiPath(`/sessions/${encodeURIComponent(sessionId)}/checkout`),
    data,
  );
  return res.data.data;
}

export async function confirmPayment(sessionId: string, paymentIntentId: string): Promise<PitchSession> {
  const res = await apiClient.post<{ data: JsonObject }>(
    pitchApiPath(`/sessions/${encodeURIComponent(sessionId)}/confirm-payment`),
    { payment_intent_id: paymentIntentId },
  );
  return parsePitchSession(res.data.data);
}

/* ─── Auth (inline signup / login for pitch flow) ─────────────────────── */

export async function pitchRegister(data: {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}): Promise<{ user: JsonObject; token: string }> {
  const base = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8000").replace(/\/$/, "");
  const res = await apiClient.post<{ user: JsonObject; token: string; data?: { user: JsonObject; token: string } }>(
    `${base}/register`,
    data,
  );
  const payload = res.data.data ?? res.data;
  return { user: payload.user, token: payload.token };
}

export async function pitchLogin(data: {
  email: string;
  password: string;
}): Promise<{ user: JsonObject; token: string }> {
  const base = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8000").replace(/\/$/, "");
  const res = await apiClient.post<{ user: JsonObject; token: string; data?: { user: JsonObject; token: string } }>(
    `${base}/login`,
    data,
  );
  const payload = res.data.data ?? res.data;
  return { user: payload.user, token: payload.token };
}

