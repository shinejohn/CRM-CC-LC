/**
 * Subscriber types
 */

export interface Subscriber {
  id: string;
  email: string;
  name?: string;
  status: string;
  community_id?: string;
  created_at: string;
  updated_at: string;
}

export interface SubscriberPreference {
  subscriber_id: string;
  preferences: Record<string, unknown>;
}
