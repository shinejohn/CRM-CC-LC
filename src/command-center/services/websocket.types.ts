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

