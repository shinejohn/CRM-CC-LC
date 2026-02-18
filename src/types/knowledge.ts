/**
 * Knowledge base, FAQ, and article types
 */

export interface Knowledge {
  id: string;
  title: string;
  content?: string;
  type: string;
  created_at: string;
  updated_at: string;
}

export interface FaqCategory {
  id: string;
  name: string;
  order?: number;
  created_at: string;
}

export interface Article {
  id: string;
  title: string;
  slug?: string;
  content?: string;
  created_at: string;
  updated_at: string;
}
