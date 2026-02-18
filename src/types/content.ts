/**
 * Content generation and management types
 */

export interface GeneratedContent {
  id: string;
  smb_id: string;
  title: string;
  type: string;
  status: string;
  body?: string;
  created_at: string;
  updated_at: string;
}

export interface ContentTemplate {
  id: string;
  name: string;
  type: string;
  body?: string;
  created_at: string;
}

export interface ContentVersion {
  id: string;
  content_id: string;
  version: number;
  body?: string;
  created_at: string;
}
