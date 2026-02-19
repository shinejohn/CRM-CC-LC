// ============================================
// REAL-TIME EVENT HANDLERS AND SUBSCRIPTIONS
// WebSocket when available, intelligent polling fallback
// ============================================

import { getEcho, getConnectionState, subscribeToConnectionState } from './websocket';
import type { ConnectionState } from './websocket';

export type RealtimeEventType =
  | 'CampaignCompleted'
  | 'NewSubscriber'
  | 'NewNotification'
  | 'ActivityCreated'
  | 'DealUpdated'
  | 'CustomerUpdated';

export interface RealtimeEvent {
  type: RealtimeEventType;
  payload: Record<string, unknown>;
  timestamp: string;
}

export const POLL_INTERVALS = {
  notifications: 30_000, // 30s
  activityFeed: 15_000, // 15s
  dashboardMetrics: 60_000, // 1min
  campaignStatus: 10_000, // 10s (only during active campaigns)
} as const;

type EventHandler = (event: RealtimeEvent) => void;
const eventHandlers = new Map<RealtimeEventType | '*', Set<EventHandler>>();

/**
 * Subscribe to real-time events (from WebSocket or polling)
 */
export function subscribeToRealtimeEvents(
  eventType: RealtimeEventType | '*',
  handler: EventHandler
): () => void {
  if (!eventHandlers.has(eventType)) {
    eventHandlers.set(eventType, new Set());
  }
  eventHandlers.get(eventType)!.add(handler);
  return () => {
    const handlers = eventHandlers.get(eventType);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) eventHandlers.delete(eventType);
    }
  };
}

/**
 * Emit an event to all subscribers (called by WebSocket handlers or polling)
 */
export function emitRealtimeEvent(event: RealtimeEvent): void {
  const handlers = eventHandlers.get(event.type);
  if (handlers) handlers.forEach((h) => h(event));
  const wildcardHandlers = eventHandlers.get('*');
  if (wildcardHandlers) wildcardHandlers.forEach((h) => h(event));
}

/**
 * Subscribe to SMB-specific private channel when Echo is available
 */
export function subscribeToSmbChannel(
  smbId: string,
  handlers: Partial<Record<RealtimeEventType, (payload: unknown) => void>>
): () => void {
  const echo = getEcho();
  if (!echo || typeof (echo as { private: (ch: string) => unknown }).private !== 'function') {
    return () => {};
  }

  const channel = (echo as { private: (ch: string) => { listen: (ev: string, cb: (e: unknown) => void) => void } }).private(
    `smb.${smbId}`
  );

  const unsubs: Array<() => void> = [];
  Object.entries(handlers).forEach(([event, cb]) => {
    if (typeof cb === 'function') {
      channel.listen(event, (payload: unknown) => {
        emitRealtimeEvent({ type: event as RealtimeEventType, payload: (payload as Record<string, unknown>) || {}, timestamp: new Date().toISOString() });
        cb(payload);
      });
      unsubs.push(() => {
        if (typeof (channel as { stopListening: (ev: string) => void }).stopListening === 'function') {
          (channel as { stopListening: (ev: string) => void }).stopListening(event);
        }
      });
    }
  });

  return () => unsubs.forEach((u) => u());
}

/**
 * Check if WebSocket is available and connected
 */
export function isRealtimeConnected(): boolean {
  return getConnectionState() === 'connected';
}

export { getConnectionState, subscribeToConnectionState };
export type { ConnectionState };
