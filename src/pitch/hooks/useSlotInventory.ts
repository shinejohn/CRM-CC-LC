import { useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  getSlotStatusBatch,
  slotInventoryKey,
  type SlotRequest,
} from "@/pitch/api/pitchApi";
import type { SlotStatus } from "@/pitch/types";

function stableBatchKey(requests: SlotRequest[]): string {
  const sorted = [...requests].map((r) => ({
    community_id: String(r.community_id),
    slot_type: r.slot_type,
    category: r.category,
    platform: r.platform ?? "day_news",
  }));
  sorted.sort(
    (a, b) =>
      a.community_id.localeCompare(b.community_id) ||
      a.slot_type.localeCompare(b.slot_type) ||
      a.category.localeCompare(b.category) ||
      a.platform.localeCompare(b.platform)
  );
  return JSON.stringify(sorted);
}

/**
 * Cached slot lookups (5-minute stale time). Merges results from multiple batch calls.
 */
export function useSlotInventory() {
  const queryClient = useQueryClient();
  const [merged, setMerged] = useState<Record<string, SlotStatus>>({});
  const [inFlight, setInFlight] = useState(0);

  const getSlotStatus = useCallback(
    (communityId: string, slotType: string, category: string, platform = "day_news") =>
      merged[slotInventoryKey(communityId, slotType, category, platform)] ?? null,
    [merged]
  );

  const batchFetch = useCallback(
    async (requests: SlotRequest[]) => {
      if (!requests.length) {
        return {};
      }
      const key = stableBatchKey(requests);
      setInFlight((n) => n + 1);
      try {
        const record = await queryClient.fetchQuery({
          queryKey: ["pitch-slots-batch", key] as const,
          queryFn: () => getSlotStatusBatch(requests),
          staleTime: 5 * 60 * 1000,
          gcTime: 15 * 60 * 1000,
        });
        setMerged((prev) => ({ ...prev, ...record }));
        return record;
      } finally {
        setInFlight((n) => Math.max(0, n - 1));
      }
    },
    [queryClient]
  );

  return { getSlotStatus, batchFetch, merged, isLoading: inFlight > 0 };
}
