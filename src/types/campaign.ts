/**
 * Campaign types for outbound marketing
 */

export interface Campaign {
  id: string;
  smb_id: string;
  name: string;
  type: string;
  status: string;
  recipients_count?: number;
  sent_count?: number;
  created_at: string;
  updated_at: string;
}

export interface CampaignRecipient {
  id: string;
  campaign_id: string;
  customer_id: string;
  status: string;
  sent_at?: string;
}

export interface CampaignSend {
  campaign_id: string;
  scheduled_at?: string;
}
