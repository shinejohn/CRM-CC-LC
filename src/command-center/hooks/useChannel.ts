import { useEffect, useRef } from 'react';
import { useWebSocket } from './useWebSocket';
import { ChannelHandler } from '../services/websocket.types';

/**
 * Convenience hook for subscribing to a single channel
 */
export function useChannel(channel: string, handler: ChannelHandler): void {
  const { subscribe, unsubscribe, isConnected } = useWebSocket();
  const handlerRef = useRef(handler);
  
  // Keep handler ref updated
  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    if (!isConnected) return;

    const wrappedHandler: ChannelHandler = (payload, message) => {
      handlerRef.current(payload, message);
    };

    const unsubscribe = subscribe(channel, wrappedHandler);
    
    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [channel, isConnected, subscribe]);
}

