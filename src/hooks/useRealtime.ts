// ============================================
// HOOK: Subscribe to real-time events
// ============================================

import { useEffect, useState, useCallback } from 'react';
import {
  subscribeToRealtimeEvents,
  subscribeToConnectionState,
  subscribeToSmbChannel,
  isRealtimeConnected,
  type RealtimeEvent,
  type RealtimeEventType,
} from '../services/realtime';
import type { ConnectionState } from '../services/websocket';

interface UseRealtimeOptions {
  smbId?: string;
  eventTypes?: RealtimeEventType[];
  onEvent?: (event: RealtimeEvent) => void;
}

export function useRealtime(options: UseRealtimeOptions = {}) {
  const { smbId, eventTypes = [], onEvent } = options;
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const [lastEvent, setLastEvent] = useState<RealtimeEvent | null>(null);

  const handleEvent = useCallback(
    (event: RealtimeEvent) => {
      setLastEvent(event);
      onEvent?.(event);
    },
    [onEvent]
  );

  useEffect(() => {
    const unsubState = subscribeToConnectionState(setConnectionState);
    return unsubState;
  }, []);

  useEffect(() => {
    if (eventTypes.length === 0 && !onEvent) return;
    const types = eventTypes.length > 0 ? eventTypes : (['*'] as RealtimeEventType[]);
    const unsubs = types.map((t) => subscribeToRealtimeEvents(t, handleEvent));
    return () => unsubs.forEach((u) => u());
  }, [eventTypes.join(','), handleEvent, onEvent]);

  useEffect(() => {
    if (!smbId) return;
    const handlers: Partial<Record<RealtimeEventType, (payload: unknown) => void>> = {};
    eventTypes.forEach((t) => {
      handlers[t] = (payload) => handleEvent({ type: t, payload: (payload as Record<string, unknown>) || {}, timestamp: new Date().toISOString() });
    });
    if (Object.keys(handlers).length === 0) return;
    const unsub = subscribeToSmbChannel(smbId, handlers);
    return unsub;
  }, [smbId, eventTypes.join(','), handleEvent]);

  return {
    connectionState,
    isConnected: isRealtimeConnected(),
    lastEvent,
  };
}
