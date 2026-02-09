# CC-SVC-01: WebSocket Service

## Module Overview

| Property | Value |
|----------|-------|
| Module ID | CC-SVC-01 |
| Name | WebSocket Service |
| Phase | 2 - Core Services |
| Dependencies | CC-CORE-01 (App Shell), CC-CORE-03 (Auth) |
| Estimated Time | 3 hours |
| Agent Assignment | Agent 4 |

---

## Purpose

Create a robust WebSocket service for real-time communication. This enables live updates for activities, customer changes, notifications, and AI responses without polling.

---

## WebSocket Endpoint

```
WS /ws/command-center?token={jwt}

Event Channels:
- activity.*        (activity.created, activity.updated, activity.completed)
- customer.*        (customer.created, customer.updated, customer.engagement)
- notification.*    (notification.new, notification.read)
- ai.*              (ai.response, ai.stream, ai.tool_call)
- campaign.*        (campaign.sent, campaign.delivered, campaign.opened)
- system.*          (system.maintenance, system.update)
```

---

## Deliverables

### 1. WebSocket Types

```typescript
// src/command-center/services/websocket.types.ts

export interface WebSocketMessage {
  type: string;
  channel: string;
  payload: any;
  timestamp: string;
  id?: string;
}

export interface WebSocketConfig {
  url: string;
  token: string;
  reconnectAttempts?: number;
  reconnectInterval?: number;
  heartbeatInterval?: number;
  onOpen?: () => void;
  onClose?: (event: CloseEvent) => void;
  onError?: (error: Event) => void;
}

export type ConnectionState = 'connecting' | 'connected' | 'disconnected' | 'reconnecting' | 'error';

export interface WebSocketState {
  connectionState: ConnectionState;
  lastConnected: Date | null;
  reconnectAttempt: number;
  messageQueue: WebSocketMessage[];
}

export type MessageHandler = (message: WebSocketMessage) => void;
export type ChannelHandler = (payload: any, message: WebSocketMessage) => void;
```

### 2. WebSocket Service Class

```typescript
// src/command-center/services/websocket.service.ts

import { 
  WebSocketConfig, 
  WebSocketMessage, 
  ConnectionState,
  MessageHandler,
  ChannelHandler 
} from './websocket.types';

type Unsubscribe = () => void;

class WebSocketService {
  private ws: WebSocket | null = null;
  private config: WebSocketConfig | null = null;
  private connectionState: ConnectionState = 'disconnected';
  private reconnectAttempt = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private messageQueue: WebSocketMessage[] = [];
  
  // Event handlers
  private messageHandlers = new Set<MessageHandler>();
  private channelHandlers = new Map<string, Set<ChannelHandler>>();
  private stateChangeHandlers = new Set<(state: ConnectionState) => void>();

  // Default config
  private readonly DEFAULT_RECONNECT_ATTEMPTS = 5;
  private readonly DEFAULT_RECONNECT_INTERVAL = 3000;
  private readonly DEFAULT_HEARTBEAT_INTERVAL = 30000;

  /**
   * Initialize and connect WebSocket
   */
  connect(config: WebSocketConfig): void {
    this.config = config;
    this.createConnection();
  }

  /**
   * Disconnect and cleanup
   */
  disconnect(): void {
    this.cleanup();
    this.setConnectionState('disconnected');
  }

  /**
   * Send a message
   */
  send(message: Omit<WebSocketMessage, 'timestamp' | 'id'>): void {
    const fullMessage: WebSocketMessage = {
      ...message,
      timestamp: new Date().toISOString(),
      id: crypto.randomUUID(),
    };

    if (this.connectionState === 'connected' && this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(fullMessage));
    } else {
      // Queue message for when connection is restored
      this.messageQueue.push(fullMessage);
    }
  }

  /**
   * Subscribe to all messages
   */
  onMessage(handler: MessageHandler): Unsubscribe {
    this.messageHandlers.add(handler);
    return () => this.messageHandlers.delete(handler);
  }

  /**
   * Subscribe to a specific channel (supports wildcards)
   * Examples: 'activity.created', 'activity.*', '*'
   */
  subscribe(channel: string, handler: ChannelHandler): Unsubscribe {
    if (!this.channelHandlers.has(channel)) {
      this.channelHandlers.set(channel, new Set());
    }
    this.channelHandlers.get(channel)!.add(handler);
    
    return () => {
      const handlers = this.channelHandlers.get(channel);
      if (handlers) {
        handlers.delete(handler);
        if (handlers.size === 0) {
          this.channelHandlers.delete(channel);
        }
      }
    };
  }

  /**
   * Unsubscribe from a channel
   */
  unsubscribe(channel: string, handler: ChannelHandler): void {
    const handlers = this.channelHandlers.get(channel);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  /**
   * Subscribe to connection state changes
   */
  onStateChange(handler: (state: ConnectionState) => void): Unsubscribe {
    this.stateChangeHandlers.add(handler);
    // Immediately call with current state
    handler(this.connectionState);
    return () => this.stateChangeHandlers.delete(handler);
  }

  /**
   * Get current connection state
   */
  getState(): ConnectionState {
    return this.connectionState;
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.connectionState === 'connected';
  }

  // Private methods

  private createConnection(): void {
    if (!this.config) return;

    this.setConnectionState('connecting');
    
    const url = new URL(this.config.url);
    url.searchParams.set('token', this.config.token);
    
    this.ws = new WebSocket(url.toString());
    
    this.ws.onopen = this.handleOpen.bind(this);
    this.ws.onclose = this.handleClose.bind(this);
    this.ws.onerror = this.handleError.bind(this);
    this.ws.onmessage = this.handleMessage.bind(this);
  }

  private handleOpen(): void {
    this.setConnectionState('connected');
    this.reconnectAttempt = 0;
    this.config?.onOpen?.();
    
    // Start heartbeat
    this.startHeartbeat();
    
    // Flush message queue
    this.flushMessageQueue();
  }

  private handleClose(event: CloseEvent): void {
    this.stopHeartbeat();
    this.config?.onClose?.(event);
    
    if (event.code !== 1000 && event.code !== 1001) {
      // Abnormal close, attempt reconnect
      this.attemptReconnect();
    } else {
      this.setConnectionState('disconnected');
    }
  }

  private handleError(error: Event): void {
    this.setConnectionState('error');
    this.config?.onError?.(error);
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const message: WebSocketMessage = JSON.parse(event.data);
      
      // Handle heartbeat response
      if (message.type === 'pong') return;
      
      // Notify all message handlers
      this.messageHandlers.forEach(handler => handler(message));
      
      // Notify channel-specific handlers
      this.notifyChannelHandlers(message);
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
    }
  }

  private notifyChannelHandlers(message: WebSocketMessage): void {
    const { channel, payload } = message;
    const channelParts = channel.split('.');
    
    // Check for exact match
    this.channelHandlers.get(channel)?.forEach(handler => handler(payload, message));
    
    // Check for wildcard matches
    // e.g., 'activity.created' matches 'activity.*'
    if (channelParts.length > 1) {
      const wildcardChannel = `${channelParts[0]}.*`;
      this.channelHandlers.get(wildcardChannel)?.forEach(handler => handler(payload, message));
    }
    
    // Check for global wildcard
    this.channelHandlers.get('*')?.forEach(handler => handler(payload, message));
  }

  private attemptReconnect(): void {
    const maxAttempts = this.config?.reconnectAttempts ?? this.DEFAULT_RECONNECT_ATTEMPTS;
    const interval = this.config?.reconnectInterval ?? this.DEFAULT_RECONNECT_INTERVAL;
    
    if (this.reconnectAttempt >= maxAttempts) {
      this.setConnectionState('error');
      return;
    }
    
    this.setConnectionState('reconnecting');
    this.reconnectAttempt++;
    
    // Exponential backoff
    const delay = interval * Math.pow(2, this.reconnectAttempt - 1);
    
    this.reconnectTimer = setTimeout(() => {
      this.createConnection();
    }, delay);
  }

  private startHeartbeat(): void {
    const interval = this.config?.heartbeatInterval ?? this.DEFAULT_HEARTBEAT_INTERVAL;
    
    this.heartbeatTimer = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, interval);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private flushMessageQueue(): void {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (message && this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify(message));
      }
    }
  }

  private setConnectionState(state: ConnectionState): void {
    this.connectionState = state;
    this.stateChangeHandlers.forEach(handler => handler(state));
  }

  private cleanup(): void {
    this.stopHeartbeat();
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
    
    this.messageQueue = [];
  }
}

// Singleton export
export const websocketService = new WebSocketService();
```

### 3. useWebSocket Hook

```typescript
// src/command-center/hooks/useWebSocket.ts

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
  subscribe: (channel: string, handler: ChannelHandler) => void;
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
```

### 4. useChannel Hook (Convenience)

```typescript
// src/command-center/hooks/useChannel.ts

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

    subscribe(channel, wrappedHandler);
    
    return () => {
      unsubscribe(channel, wrappedHandler);
    };
  }, [channel, isConnected, subscribe, unsubscribe]);
}
```

### 5. Connection Status Component

```typescript
// src/command-center/components/ui/ConnectionStatus.tsx

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff, Loader2 } from 'lucide-react';
import { useWebSocket } from '../../hooks/useWebSocket';

export function ConnectionStatus() {
  const { connectionState, isConnected } = useWebSocket();

  const getStatusConfig = () => {
    switch (connectionState) {
      case 'connected':
        return {
          icon: Wifi,
          color: 'text-green-500',
          bg: 'bg-green-100 dark:bg-green-900/30',
          label: 'Connected',
        };
      case 'connecting':
      case 'reconnecting':
        return {
          icon: Loader2,
          color: 'text-yellow-500',
          bg: 'bg-yellow-100 dark:bg-yellow-900/30',
          label: connectionState === 'reconnecting' ? 'Reconnecting...' : 'Connecting...',
          animate: true,
        };
      case 'disconnected':
      case 'error':
        return {
          icon: WifiOff,
          color: 'text-red-500',
          bg: 'bg-red-100 dark:bg-red-900/30',
          label: 'Disconnected',
        };
      default:
        return {
          icon: WifiOff,
          color: 'text-gray-500',
          bg: 'bg-gray-100',
          label: 'Unknown',
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <AnimatePresence>
      {!isConnected && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className={`fixed top-20 right-4 z-50 flex items-center gap-2 px-3 py-2 rounded-lg ${config.bg}`}
        >
          <Icon className={`w-4 h-4 ${config.color} ${config.animate ? 'animate-spin' : ''}`} />
          <span className={`text-sm font-medium ${config.color}`}>
            {config.label}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

---

## Testing Requirements

```typescript
// src/command-center/services/__tests__/websocket.service.test.ts

import { websocketService } from '../websocket.service';

// Mock WebSocket
class MockWebSocket {
  onopen: (() => void) | null = null;
  onclose: ((event: any) => void) | null = null;
  onmessage: ((event: any) => void) | null = null;
  onerror: ((error: any) => void) | null = null;
  readyState = WebSocket.CONNECTING;

  constructor(public url: string) {
    setTimeout(() => {
      this.readyState = WebSocket.OPEN;
      this.onopen?.();
    }, 10);
  }

  send = jest.fn();
  close = jest.fn();
}

global.WebSocket = MockWebSocket as any;

describe('WebSocketService', () => {
  beforeEach(() => {
    websocketService.disconnect();
  });

  it('connects with token', async () => {
    websocketService.connect({
      url: 'ws://localhost/ws',
      token: 'test-token',
    });
    
    await new Promise(resolve => setTimeout(resolve, 50));
    expect(websocketService.isConnected()).toBe(true);
  });

  it('handles channel subscriptions', () => {
    const handler = jest.fn();
    const unsub = websocketService.subscribe('activity.created', handler);
    
    expect(typeof unsub).toBe('function');
  });

  it('notifies handlers on message', async () => {
    const handler = jest.fn();
    websocketService.subscribe('test.channel', handler);
    
    // Simulate message (would need proper mock setup)
  });
});
```

---

## Acceptance Criteria

- [ ] WebSocket connects with JWT token
- [ ] Reconnection works with exponential backoff
- [ ] Heartbeat keeps connection alive
- [ ] Message queue works when disconnected
- [ ] Channel subscriptions with wildcards work
- [ ] Connection state updates propagate
- [ ] useWebSocket hook manages lifecycle
- [ ] useChannel provides simple subscription
- [ ] ConnectionStatus shows visual feedback
- [ ] Cleanup on unmount works properly

---

## Handoff

When complete, this module provides:

1. `websocketService` - Singleton service
2. `useWebSocket` - Main React hook
3. `useChannel` - Single-channel subscription hook
4. `ConnectionStatus` - Visual status component

Other agents import:
```typescript
import { websocketService } from '@/command-center/services/websocket.service';
import { useWebSocket, useChannel } from '@/command-center/hooks';
import { ConnectionStatus } from '@/command-center/components/ui';
```
