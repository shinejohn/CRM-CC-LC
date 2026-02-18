/**
 * SMB (Small/Medium Business) profile types
 */

export type BusinessMode = 'b2b' | 'b2c' | 'hybrid';

export interface SMBProfile {
  id: string;
  name: string;
  slug?: string;
  business_mode?: BusinessMode;
  industry?: string;
  settings?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface SMB {
  id: string;
  name: string;
  slug?: string;
  business_mode?: BusinessMode;
  industry?: string;
  created_at: string;
  updated_at: string;
}
