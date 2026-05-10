import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/api';
import type {
  TimelinesResponse,
  SimulationResult,
  SimulationParams,
} from './types';

// ---------------------------------------------------------------------------
// Query keys
// ---------------------------------------------------------------------------

const keys = {
  all: ['manifest-destiny'] as const,
  timelines: () => [...keys.all, 'timelines'] as const,
  simulation: (params: SimulationParams) =>
    [...keys.all, 'simulate', params.timeline, params.profile, params.business_name ?? '', params.community_name ?? ''] as const,
};

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

/** Fetch the list of available Manifest Destiny timelines. */
export function useTimelineList() {
  return useQuery({
    queryKey: keys.timelines(),
    queryFn: async () => {
      const { data } = await apiClient.get<TimelinesResponse>(
        '/manifest-destiny/timelines',
      );
      return data.timelines;
    },
    staleTime: 5 * 60 * 1000, // timelines rarely change
  });
}

/** Fetch a full simulation run. Enabled only when a timeline slug is set. */
export function useSimulation(params: SimulationParams) {
  return useQuery({
    queryKey: keys.simulation(params),
    queryFn: async () => {
      const { data } = await apiClient.get<SimulationResult>(
        '/manifest-destiny/simulate',
        {
          params: {
            timeline: params.timeline,
            profile: params.profile,
            business_name: params.business_name,
            community_name: params.community_name,
          },
        },
      );
      return data;
    },
    enabled: !!params.timeline,
    staleTime: 2 * 60 * 1000,
  });
}
