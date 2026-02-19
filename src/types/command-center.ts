// ============================================
// SHARED COMMAND CENTER TYPE DEFINITIONS
// All agents import from this file
// ============================================

import React from 'react';

// User Context
export interface User {
  id: string;
  email: string;
  businessId: string;
  businessName: string;
  role: 'owner' | 'admin' | 'member';
  tier: 'free' | 'starter' | 'growth' | 'enterprise';
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  sidebarCollapsed: boolean;
  defaultView: 'dashboard' | 'activities' | 'ai';
  notificationsEnabled: boolean;
}

// Navigation - FeatureFlagKey aligned with src/services/featureFlags.ts
export type FeatureFlagKey =
  | 'loyalty_program'
  | 'process_builder'
  | 'automation_rules'
  | 'job_board'
  | 'implementation_tracker'
  | 'video_tutorials'
  | 'certifications'
  | 'community_forum';

export interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  badge?: number | string;
  featureFlag?: FeatureFlagKey;
  adminOnly?: boolean;
  children?: NavItem[];
}

// Cards & Widgets
export interface DashboardCard {
  id: string;
  type: CardType;
  title: string;
  defaultColor: string;
  position: { row: number; col: number };
  size: { rows: number; cols: number };
  data?: any;
}

export type CardType = 
  | 'tasks' | 'email' | 'messages' | 'calendar' 
  | 'files' | 'articles' | 'content' | 'events'
  | 'social' | 'voicemail' | 'advertisements' | 'metrics';

// Activities & Interactions
export interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: string;
  customerId?: string;
  metadata: Record<string, any>;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
}

export type ActivityType = 
  | 'phone_call' | 'email' | 'sms' | 'meeting' 
  | 'task' | 'note' | 'deal_update' | 'campaign';

// Customer
export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  stage: CustomerStage;
  engagementScore: number;
  predictiveScore: number;
  lastInteraction?: string;
  tags: string[];
}

export type CustomerStage = 
  | 'lead' | 'prospect' | 'customer' | 'advocate' | 'churned';

// AI Assistant
export interface AIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  metadata?: {
    toolCalls?: ToolCall[];
    citations?: Citation[];
  };
}

export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, any>;
  result?: any;
}

export interface Citation {
  source: string;
  url?: string;
  excerpt: string;
}

// Events
export interface CommandCenterEvent {
  type: EventType;
  payload: any;
  timestamp: string;
  source: string;
}

export type EventType = 
  | 'ACTIVITY_CREATED' | 'ACTIVITY_UPDATED' | 'ACTIVITY_COMPLETED'
  | 'CUSTOMER_UPDATED' | 'DEAL_STAGE_CHANGED'
  | 'NOTIFICATION_RECEIVED' | 'AI_RESPONSE_RECEIVED'
  | 'WEBSOCKET_CONNECTED' | 'WEBSOCKET_DISCONNECTED';

// API Response Wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  meta?: {
    page?: number;
    perPage?: number;
    total?: number;
  };
}

// Search
export interface SearchResult {
  type: 'customer' | 'content' | 'campaign' | 'activity' | 'service';
  id: string;
  title: string;
  subtitle?: string;
  url: string;
  score: number;
}

// Notifications
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

