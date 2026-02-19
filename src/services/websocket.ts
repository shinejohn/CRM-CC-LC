// ============================================
// WEBSOCKET CONNECTION MANAGER
// Laravel Echo + Pusher/Soketi when configured
// Falls back to null when not available (polling used instead)
// ============================================

export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error';

export interface WebSocketConfig {
  broadcaster?: 'pusher' | 'soketi';
  key?: string;
  cluster?: string;
  forceTLS?: boolean;
  authEndpoint?: string;
  token?: string;
}

let echoInstance: unknown = null;
let connectionState: ConnectionState = 'disconnected';
const stateListeners = new Set<(state: ConnectionState) => void>();

function notifyStateListeners(): void {
  stateListeners.forEach((fn) => fn(connectionState));
}

export function getConnectionState(): ConnectionState {
  return connectionState;
}

export function subscribeToConnectionState(listener: (state: ConnectionState) => void): () => void {
  stateListeners.add(listener);
  listener(connectionState);
  return () => stateListeners.delete(listener);
}

/**
 * Initialize WebSocket (Laravel Echo + Pusher) when env vars are configured.
 * Returns the Echo instance or null if not configured.
 */
export async function initWebSocket(config?: Partial<WebSocketConfig>): Promise<unknown> {
  const key = config?.key ?? import.meta.env.VITE_PUSHER_APP_KEY;
  const cluster = config?.cluster ?? import.meta.env.VITE_PUSHER_APP_CLUSTER ?? 'us2';

  if (!key || typeof key !== 'string' || key.trim() === '') {
    connectionState = 'disconnected';
    notifyStateListeners();
    return null;
  }

  connectionState = 'connecting';
  notifyStateListeners();

  try {
    // Dynamic import - requires laravel-echo and pusher-js when using Pusher
    const [Echo, Pusher] = await Promise.all([
      import('laravel-echo').then((m) => m.default),
      import('pusher-js').then((m) => m.default),
    ]);

    (window as unknown as { Pusher: unknown }).Pusher = Pusher;

    const echo = new Echo({
      broadcaster: 'pusher',
      key,
      cluster,
      forceTLS: config?.forceTLS ?? true,
      authEndpoint: config?.authEndpoint ?? `${import.meta.env.VITE_API_ENDPOINT || ''}/broadcasting/auth`,
      auth: {
        headers: config?.token
          ? { Authorization: `Bearer ${config.token}` }
          : undefined,
      },
    });

    echoInstance = echo;
    connectionState = 'connected';
    notifyStateListeners();
    return echo;
  } catch (err) {
    console.warn('[WebSocket] Pusher/Echo not available, using polling fallback:', err);
    connectionState = 'disconnected';
    notifyStateListeners();
    return null;
  }
}

/**
 * Get the current Echo instance (null if not initialized)
 */
export function getEcho(): unknown {
  return echoInstance;
}

/**
 * Disconnect and cleanup
 */
export function disconnectWebSocket(): void {
  if (echoInstance && typeof (echoInstance as { disconnect: () => void }).disconnect === 'function') {
    (echoInstance as { disconnect: () => void }).disconnect();
  }
  echoInstance = null;
  connectionState = 'disconnected';
  notifyStateListeners();
}
