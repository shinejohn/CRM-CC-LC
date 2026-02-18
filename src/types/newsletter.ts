/**
 * Newsletter types
 */

export interface Newsletter {
  id: string;
  smb_id: string;
  name: string;
  subject?: string;
  status: string;
  sent_at?: string;
  created_at: string;
  updated_at: string;
}

export interface NewsletterSchedule {
  id: string;
  newsletter_id: string;
  scheduled_at: string;
  status: string;
}

export interface Sponsor {
  id: string;
  name: string;
  logo_url?: string;
  created_at: string;
}
