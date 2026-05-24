import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { websocketService } from '../services/websocket.service';
import type { ConnectionState, ChannelHandler } from '../services/websocket.types';

interface UseWebSocketOptions {
  autoConnect?: boolean;
}

interface UseWebSocketReturn {
  connectionState: ConnectionState;
  isConnected: boolean;
  send: (type: string, channel: string, payload: unknown) => void;
  subscribe: (channel: string, handler: ChannelHandler) => () => void;
  unsubscribe: (channel: string, handler: ChannelHandler) => void;
  connect: () => void;
  disconnect: () => void;
}

export function useWebSocket(options: UseWebSocketOptions = {}): UseWebSocketReturn {
  const { autoConnect = true } = options;
  const { token, isAuthenticated } = useAuthStore();
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const subscriptionsRef = useRef<(() => void)[]>([]);

  useEffect(() => {
    if (!autoConnect || !isAuthenticated || !token) return;

    const wsUrl =
      import.meta.env.VITE_WS_URL ||
      `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws/command-center`;

    websocketService.connect({
      url: wsUrl,
      token,
      onOpen: () => {},
      onClose: () => {},
      onError: () => {},
    });

    const unsubscribe = websocketService.onStateChange(setConnectionState);

    return () => {
      unsubscribe();
      if (autoConnect) websocketService.disconnect();
    };
  }, [autoConnect, isAuthenticated, token]);

  useEffect(() => {
    return () => {
      subscriptionsRef.current.forEach((unsub) => unsub());
      subscriptionsRef.current = [];
    };
  }, []);

  const send = useCallback((type: string, channel: string, payload: unknown) => {
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
    if (!token) return;
    const wsUrl =
      import.meta.env.VITE_WS_URL ||
      `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws/command-center`;
    websocketService.connect({ url: wsUrl, token });
  }, [token]);

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
