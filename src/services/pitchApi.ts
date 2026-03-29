/**
 * @deprecated Import from `@/pitch/api/pitchApi` for new code.
 * Re-exports preserve imports used by pitch steps before Agent 4.
 */
export {
  searchBusinesses as searchPitchBusinesses,
  getNearbyCommunities as fetchPitchNearbyCommunities,
  resolveCommunitySlug as fetchPitchCommunityBySlug,
  getSlotStatusBatch,
  slotInventoryKey,
  slotStatusFromBatchRow,
  type SlotRequest as SlotBatchKey,
} from "@/pitch/api/pitchApi";

import { getSlotStatusBatch, slotInventoryKey } from "@/pitch/api/pitchApi";
import type { SlotRequest } from "@/pitch/api/pitchApi";

/** @deprecated Prefer getSlotStatusBatch — this adapts the keyed map to an ordered array. */
export async function fetchPitchSlotBatch(keys: SlotRequest[]) {
  const map = await getSlotStatusBatch(keys);
  return keys.map((k) => {
    const rowKey = slotInventoryKey(k.community_id, k.slot_type, k.category, k.platform ?? "day_news");
    const slot = map[rowKey];
    if (slot) {
      return {
        community_id: k.community_id,
        slot_type: k.slot_type,
        category: k.category,
        platform: k.platform ?? "day_news",
        total_slots: slot.total,
        held_slots: slot.held,
        available_slots: slot.available,
        status: slot.status,
      };
    }
    return {
      community_id: k.community_id,
      slot_type: k.slot_type,
      category: k.category,
      platform: k.platform ?? "day_news",
      total_slots: 0,
      held_slots: 0,
      available_slots: 0,
      status: "open",
    };
  });
}
