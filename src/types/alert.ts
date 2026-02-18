/**
 * Alert types
 */

export interface Alert {
  id: string;
  smb_id: string;
  title: string;
  body?: string;
  category_id?: string;
  status: string;
  sent_at?: string;
  created_at: string;
  updated_at: string;
}

export interface AlertCategory {
  id: string;
  name: string;
  created_at: string;
}

export interface AlertSend {
  alert_id: string;
  scheduled_at?: string;
}
