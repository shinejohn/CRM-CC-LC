/**
 * Environment configuration for API and app settings.
 * All values read from Vite env vars - no hardcoded URLs.
 */

export const env = {
  /** API base URL including /api/v1 (e.g. https://api.fibonacco.com/api/v1) */
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',

  /** Base URL for Sanctum CSRF (domain only, no /api/v1) */
  apiBaseUrl: (() => {
    const base = import.meta.env.VITE_API_BASE_URL;
    if (base) return base;
    const url = import.meta.env.VITE_API_URL;
    if (url && typeof url === 'string') return url.replace(/\/api\/v1\/?$/, '') || url;
    return 'http://localhost:8000';
  })(),

  /** Request timeout in ms */
  apiTimeout: Number(import.meta.env.VITE_API_TIMEOUT) || 30000,
} as const;
