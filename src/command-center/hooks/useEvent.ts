// Command Center Event Bus Hooks
// CC-SVC-04: Event Bus

import { useEffect, useRef, useCallback } from 'react';
import { eventBus, Events } from '../services/events.service';

/**
 * Subscribe to an event in a React component
 * Automatically unsubscribes on unmount
 */
export function useEvent<T>(event: string, handler: (payload: T) => void): void {
  const handlerRef = useRef(handler);
  
  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    const subscription = eventBus.on<T>(event, (payload) => {
      handlerRef.current(payload);
    });
    
    return () => subscription.unsubscribe();
  }, [event]);
}

/**
 * Hook to emit events from a component
 * Returns a memoized emit function
 */
export function useEmit() {
  return useCallback(<T>(event: string, payload: T) => {
    eventBus.emit(event, payload);
  }, []);
}

/**
 * Subscribe to an event once (auto-unsubscribes after first emission)
 */
export function useEventOnce<T>(event: string, handler: (payload: T) => void): void {
  const handlerRef = useRef(handler);
  
  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    const subscription = eventBus.once<T>(event, (payload) => {
      handlerRef.current(payload);
    });
    
    return () => subscription.unsubscribe();
  }, [event]);
}

export { Events };

