/**
 * Emergency broadcast types
 */

export interface EmergencyBroadcast {
  id: string;
  title: string;
  message: string;
  category_id?: string;
  status: string;
  sent_at?: string;
  created_at: string;
  updated_at: string;
}

export interface EmergencyCategory {
  id: string;
  name: string;
  created_at: string;
}
