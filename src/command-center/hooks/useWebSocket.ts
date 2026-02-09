import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../core/AuthContext';
import { websocketService } from '../services/websocket.service';
import { ConnectionState, ChannelHandler, WebSocketMessage } from '../services/websocket.types';

interface UseWebSocketOptions {
  autoConnect?: boolean;
}

interface UseWebSocketReturn {
  connectionState: ConnectionState;
  isConnected: boolean;
  send: (type: string, channel: string, payload: any) => void;
  subscribe: (channel: string, handler: ChannelHandler) => () => void;
  unsubscribe: (channel: string, handler: ChannelHandler) => void;
  connect: () => void;
  disconnect: () => void;
}

export function useWebSocket(options: UseWebSocketOptions = {}): UseWebSocketReturn {
  const { autoConnect = true } = options;
  const { tokens, isAuthenticated } = useAuth();
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const subscriptionsRef = useRef<(() => void)[]>([]);

  // Connect when authenticated
  useEffect(() => {
    if (!autoConnect || !isAuthenticated || !tokens?.accessToken) return;

    const wsUrl = import.meta.env.VITE_WS_URL || 
      `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws/command-center`;

    websocketService.connect({
      url: wsUrl,
      token: tokens.accessToken,
      onOpen: () => console.log('WebSocket connected'),
      onClose: (event) => console.log('WebSocket closed:', event.code),
      onError: (error) => console.error('WebSocket error:', error),
    });

    const unsubscribe = websocketService.onStateChange(setConnectionState);

    return () => {
      unsubscribe();
      if (autoConnect) {
        websocketService.disconnect();
      }
    };
  }, [autoConnect, isAuthenticated, tokens?.accessToken]);

  // Cleanup subscriptions on unmount
  useEffect(() => {
    return () => {
      subscriptionsRef.current.forEach(unsub => unsub());
      subscriptionsRef.current = [];
    };
  }, []);

  const send = useCallback((type: string, channel: string, payload: any) => {
    websocketService.send({ type, channel, payload });
  }, []);

  const subscribe = useCallback((channel: string, handler: ChannelHandler) => {
    const unsubscribe = websocketService.subscribe(channel, handler);
    subscriptionsRef.current.push(unsubscribe);
    return unsubscribe;
  }, []);

  const unsubscribe = useCallback((channel: string, handler: ChannelHandler) => {
    websocketService.unsubscribe(channel, handler);
  }, []);

  const connect = useCallback(() => {
    if (!tokens?.accessToken) return;
    
    const wsUrl = import.meta.env.VITE_WS_URL || 
      `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws/command-center`;

    websocketService.connect({
      url: wsUrl,
      token: tokens.accessToken,
    });
  }, [tokens?.accessToken]);

  const disconnect = useCallback(() => {
    websocketService.disconnect();
  }, []);

  return {
    connectionState,
    isConnected: connectionState === 'connected',
    send,
    subscribe,
    unsubscribe,
    connect,
    disconnect,
  };
}

