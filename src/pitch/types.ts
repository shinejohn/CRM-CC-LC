export type EntryMode = "pitch" | "upsell";

export interface UpsellRecommendation {
  product_slug: string;
  product_name: string;
  price: number;
  reason: string;
  trigger: string;
  confidence: number;
  projected_impact: string;
  priority: number;
}

export type OrgType =
  | "smb"
  | "venue"
  | "performer"
  | "school"
  | "nonprofit"
  | "government";

export type PitchTrack =
  | "standard"
  | "professional"
  | "trades"
  | "venue"
  | "performer"
  | "civic";

export type GateKey =
  | "day_news"
  | "downtown_guide"
  | "event_host"
  | "venue"
  | "performer"
  | "golocalvoices"
  | "alphasite"
  | "civic";

export interface PitchSession {
  id: string;
  smbId?: string;
  customerId?: string;
  communityId: string;
  entryPlatform: string;
  orgType?: OrgType;
  pitchTrack?: PitchTrack;
  status: string;
  lastStep: string;
  discoveryAnswers?: DiscoveryAnswers;
  territorySelection?: string[];
  gatesOffered?: GateKey[];
  gatesCompleted?: GateKey[];
  gatesDeferred?: DeferredGate[];
  productsAccepted?: AcceptedProduct[];
  productsDeclined?: DeclinedProduct[];
  proposalId?: string;
  /** "pitch" for new customers, "upsell" for returning customers */
  flowMode?: "pitch" | "upsell";
  /** Product slugs the customer already owns (upsell mode) */
  existingProducts?: string[];
  /** AI-generated rationale for each recommended product */
  upsellRationale?: UpsellRecommendation[];
  /** What the customer currently pays monthly */
  existingMonthlyValue?: number;
  /** Populated during Identify / Community steps */
  businessName?: string;
  businessCategory?: string;
  primaryCommunityName?: string;
  primaryCommunityState?: string;
  countyName?: string;
  hasPhysicalLocation?: boolean;
  hasEvents?: "regularly" | "occasionally" | "none";
}

export interface DiscoveryAnswers {
  goal: string;
  /** Machine-readable goal for conditional gates (e.g. retention → “Since You’re Going To…”). */
  goalKey?: string;
  customerSource: string;
  marketingSpend: string;
}

export interface DeferredGate {
  gate: GateKey;
  reason: string;
  retryAfter: string;
}

export interface AcceptedProduct {
  product: string;
  price: number;
}

export interface DeclinedProduct {
  product: string;
  reason?: string;
}

export type SlotStatusLevel = "open" | "almost_full" | "full";

export interface SlotStatus {
  total: number;
  held: number;
  available: number;
  status: SlotStatusLevel;
  heldBy?: string;
}

/** Chat message in Sarah panel */
export interface SarahMessage {
  id: string;
  text: string;
  timestamp: string;
  type?: "sarah" | "system" | "user";
}

export interface FallbackProduct {
  id: string;
  label: string;
  description?: string;
}

export interface PitchProgressStep {
  key: string;
  label: string;
}

export interface FastPathGateItem {
  key: string;
  label: string;
  icon: string;
}

/** Eligibility + display context for gates (parent builds from session + discovery). */
export interface BusinessProfile {
  businessName: string;
  category: string;
  communityName: string;
  county: string;
  pitchTrack: PitchTrack;
  orgType: OrgType;
  hasPhysicalLocation: boolean;
  hasEvents: "regularly" | "occasionally" | "none";
  /** e.g. "attorney", "financial advisor" for GoLocalVoices */
  expertiseLabel: string;
  contactFirstName?: string;
  /** AlphaSite qualifying copy */
  serviceSearchTerm: string;
  categorySuggestsPhoneIntake: boolean;
  isRentableVenue?: boolean;
  isPerformer?: boolean;
}

export interface PublicBusinessSearchHit {
  id: string;
  business_name: string;
  city?: string | null;
  state?: string | null;
  category?: string | null;
  community_id?: string | null;
}

export interface PitchNearbyCommunityRow {
  id: number;
  name: string;
  slug: string;
  state?: string | null;
  county?: string | null;
  slotStatus: SlotStatus;
  rowStatus: "open" | "almost_full" | "full" | "launching_q2";
  launchingNote?: string;
}

export interface PitchStepBaseProps {
  session: PitchSession;
  onNext: (data?: Partial<PitchSession>) => void | Promise<void>;
  onBack: () => void;
  onLogEvent: (type: string, payload?: Record<string, unknown>) => void;
  /** Push scripted Sarah lines into the shell panel */
  onSarahMessage?: (text: string) => void;
}

export interface PitchGateBaseProps {
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
  /** When set, skips permission shell (e.g. inline in EventHostGate). */
  variant?: "standalone" | "embedded";
}
