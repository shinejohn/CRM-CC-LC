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

