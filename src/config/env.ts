/**
 * Environment configuration for API and app settings.
 * All values read from Vite env vars - no hardcoded URLs.
 *
 * THE CONVENTION:
 * - VITE_API_URL = API origin INCLUDING `/api` but NOT `/v1`
 *   (dev default: http://localhost:8000/api).
 * - Every request PATH in code starts with `/v1/...`.
 */

export const env = {
  /** API base URL: origin incl. `/api`, no `/v1` (e.g. https://api.fibonacco.com/api) */
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',

  /** Same base — retained for callers that reference `apiBaseUrl`. */
  apiBaseUrl: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',

  /** Request timeout in ms */
  apiTimeout: Number(import.meta.env.VITE_API_TIMEOUT) || 30000,
} as const;
