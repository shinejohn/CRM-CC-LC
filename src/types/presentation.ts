/**
 * Presentation template and generation types
 */

export interface PresentationTemplate {
  id: string;
  name: string;
  slug?: string;
  created_at: string;
}

export interface GeneratedPresentation {
  id: string;
  template_id: string;
  title: string;
  status: string;
  created_at: string;
  updated_at: string;
}
