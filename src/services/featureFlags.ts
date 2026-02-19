// ============================================
// FEATURE FLAG SERVICE
// Gates deferred features with "Coming Soon" display
// ============================================

export type FeatureFlagKey =
  | 'loyalty_program'
  | 'process_builder'
  | 'automation_rules'
  | 'job_board'
  | 'implementation_tracker'
  | 'video_tutorials'
  | 'certifications'
  | 'community_forum';

export const FEATURE_FLAGS: Record<FeatureFlagKey, boolean> = {
  loyalty_program: false,
  process_builder: false,
  automation_rules: false,
  job_board: false,
  implementation_tracker: false,
  video_tutorials: false,
  certifications: false,
  community_forum: false,
};

const overrides = new Map<FeatureFlagKey, boolean>();
const listeners = new Set<(flags: Record<FeatureFlagKey, boolean>) => void>();

function getEffectiveFlags(): Record<FeatureFlagKey, boolean> {
  const result = { ...FEATURE_FLAGS };
  overrides.forEach((value, key) => {
    result[key] = value;
  });
  return result;
}

function notifyListeners(): void {
  const flags = getEffectiveFlags();
  listeners.forEach((fn) => fn(flags));
}

/**
 * Check if a feature flag is enabled
 */
export function isFeatureEnabled(flag: FeatureFlagKey): boolean {
  return overrides.has(flag) ? overrides.get(flag)! : FEATURE_FLAGS[flag];
}

/**
 * Override a feature flag (e.g. for testing or runtime config)
 */
export function setFeatureOverride(flag: FeatureFlagKey, enabled: boolean): void {
  overrides.set(flag, enabled);
  notifyListeners();
}

/**
 * Subscribe to feature flag changes
 */
export function subscribeToFeatureFlags(listener: (flags: Record<FeatureFlagKey, boolean>) => void): () => void {
  listeners.add(listener);
  listener(getEffectiveFlags());
  return () => listeners.delete(listener);
}
