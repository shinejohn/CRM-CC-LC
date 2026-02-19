// ============================================
// FEATURE GATE
// Shows/hides content based on feature flag
// ============================================

import React, { ReactNode } from 'react';
import { useFeatureFlag } from '../hooks/useFeatureFlag';
import type { FeatureFlagKey } from '../services/featureFlags';

interface FeatureGateProps {
  flag: FeatureFlagKey;
  children: ReactNode;
  fallback?: ReactNode;
}

const DEFAULT_FALLBACK = (
  <div className="flex flex-col items-center justify-center min-h-[200px] rounded-lg border border-dashed border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/50 p-8 text-center">
    <span className="text-4xl mb-4">🚧</span>
    <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">Coming Soon</h3>
    <p className="text-sm text-slate-500 dark:text-slate-400">This feature is under development and will be available soon.</p>
  </div>
);

export function FeatureGate({ flag, children, fallback = DEFAULT_FALLBACK }: FeatureGateProps) {
  const enabled = useFeatureFlag(flag);
  return <>{enabled ? children : fallback}</>;
}
