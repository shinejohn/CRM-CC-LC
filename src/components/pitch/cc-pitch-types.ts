export type FollowUpType = "incomplete" | "proposal" | "deferred_gate";

export interface GateDeferredChip {
  gate: string;
  reason: string;
}

export interface ProductDeferredChip {
  product: string;
  reason?: string;
}

export interface SlotCountAlert {
  /** e.g. "Headliner — Arts" */
  label: string;
  previous: number;
  current: number;
}

export interface FollowUpCardModel {
  id: string;
  type: FollowUpType;
  businessName: string;
  community: string;
  contactName: string;
  contactEmail: string;
  lastActive: string;
  lastStep: string;
  gatesCompleted: string[];
  gatesDeferred: GateDeferredChip[];
  productsDeferred?: ProductDeferredChip[];
  proposalValue?: number;
  founderDaysRemaining?: number;
  slotCounts?: SlotCountAlert;
  /** For deferred gate type — which gate to re-pitch */
  targetGateKey?: string;
  targetGateLabel?: string;
}
