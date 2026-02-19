// ============================================
// HOOK: Check feature flags
// ============================================

import { useState, useEffect } from 'react';
import {
  isFeatureEnabled,
  subscribeToFeatureFlags,
  type FeatureFlagKey,
} from '../services/featureFlags';

export function useFeatureFlag(flag: FeatureFlagKey): boolean {
  const [enabled, setEnabled] = useState(() => isFeatureEnabled(flag));

  useEffect(() => {
    const unsub = subscribeToFeatureFlags((flags) => {
      setEnabled(flags[flag]);
    });
    return unsub;
  }, [flag]);

  return enabled;
}

export function useFeatureFlags(): Record<FeatureFlagKey, boolean> {
  const [flags, setFlags] = useState<Record<FeatureFlagKey, boolean>>(() => ({
    loyalty_program: isFeatureEnabled('loyalty_program'),
    process_builder: isFeatureEnabled('process_builder'),
    automation_rules: isFeatureEnabled('automation_rules'),
    job_board: isFeatureEnabled('job_board'),
    implementation_tracker: isFeatureEnabled('implementation_tracker'),
    video_tutorials: isFeatureEnabled('video_tutorials'),
    certifications: isFeatureEnabled('certifications'),
    community_forum: isFeatureEnabled('community_forum'),
  }));

  useEffect(() => {
    const unsub = subscribeToFeatureFlags(setFlags);
    return unsub;
  }, []);

  return flags;
}
