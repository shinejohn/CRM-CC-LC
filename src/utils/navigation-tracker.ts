// ============================================
// NAVIGATION TRACKER - Debug Mode
// Tracks all navigation attempts to verify routes exist
// ============================================

const SERVER_ENDPOINT = 'http://127.0.0.1:7242/ingest/e5cb2706-be56-4bc4-8f83-3baa066ca0c9';

interface NavigationLog {
  sessionId: string;
  runId: string;
  hypothesisId: string;
  location: string;
  message: string;
  data: {
    type: 'link' | 'navigate' | 'button' | 'modal' | 'api';
    target: string;
    source: string;
    routeExists?: boolean;
    componentExists?: boolean;
    error?: string;
  };
  timestamp: number;
}

export const logNavigation = (log: Omit<NavigationLog, 'timestamp' | 'sessionId' | 'runId'>) => {
  const payload: NavigationLog = {
    ...log,
    timestamp: Date.now(),
    sessionId: 'debug-session',
    runId: log.runId || 'run1',
  };

  // #region agent log
  fetch(SERVER_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).catch(() => {});
  // #endregion
};

// Track Link clicks
export const trackLinkClick = (target: string, source: string, runId = 'run1') => {
  logNavigation({
    runId,
    hypothesisId: 'A',
    location: `${source}:Link`,
    message: 'Link clicked',
    data: {
      type: 'link',
      target,
      source,
    },
  });
};

// Track navigate() calls
export const trackNavigate = (target: string, source: string, runId = 'run1') => {
  logNavigation({
    runId,
    hypothesisId: 'B',
    location: `${source}:navigate`,
    message: 'Navigation triggered',
    data: {
      type: 'navigate',
      target,
      source,
    },
  });
};

// Track button clicks
export const trackButtonClick = (action: string, source: string, runId = 'run1') => {
  logNavigation({
    runId,
    hypothesisId: 'C',
    location: `${source}:button`,
    message: 'Button clicked',
    data: {
      type: 'button',
      target: action,
      source,
    },
  });
};

// Track modal opens
export const trackModalOpen = (modalName: string, source: string, runId = 'run1') => {
  logNavigation({
    runId,
    hypothesisId: 'D',
    location: `${source}:modal`,
    message: 'Modal opened',
    data: {
      type: 'modal',
      target: modalName,
      source,
    },
  });
};

// Track API calls
export const trackAPICall = (endpoint: string, source: string, success: boolean, error?: string, runId = 'run1') => {
  logNavigation({
    runId,
    hypothesisId: 'E',
    location: `${source}:api`,
    message: success ? 'API call succeeded' : 'API call failed',
    data: {
      type: 'api',
      target: endpoint,
      source,
      error: error || undefined,
    },
  });
};






