// ============================================
// LEARNING CENTER TYPE DEFINITIONS
// ============================================

// ============================================
// ENUMS & CONSTANTS
// ============================================

export const VALIDATION_SOURCES = ['google', 'serpapi', 'website', 'owner'] as const;
export type ValidationSource = typeof VALIDATION_SOURCES[number];

export const QUESTION_TYPES = [
  'text',
  'textarea',
  'select',
  'multi_select',
  'scale',
  'date',
  'time',
  'datetime',
  'number',
  'currency',
  'phone',
  'email',
  'url',
  'address',
  'media',
  'file',
  'boolean',
  'rating'
] as const;
export type QuestionType = typeof QUESTION_TYPES[number];

export const EMBEDDING_STATUS = ['pending', 'processing', 'completed', 'failed'] as const;
export type EmbeddingStatus = typeof EMBEDDING_STATUS[number];

export const VALIDATION_STATUS = ['unverified', 'verified', 'disputed', 'outdated'] as const;
export type ValidationStatus = typeof VALIDATION_STATUS[number];

// ============================================
// KNOWLEDGE BASE
// ============================================

export interface KnowledgeArticle {
  id: string;
  tenant_id: string;
  title: string;
  content: string;
  category: string;
  subcategory?: string;
  industry_codes?: string[];

  // Vector status
  embedding_status: EmbeddingStatus;
  has_embedding: boolean;

  // Access control
  is_public: boolean;
  allowed_agents: string[];

  // Source & validation
  source: ValidationSource;
  source_url?: string;
  validation_status: ValidationStatus;
  validated_at?: string;
  validated_by?: string;

  // Usage metrics
  usage_count: number;
  helpful_count: number;
  not_helpful_count: number;
  helpfulness_score: number;

  // Audio
  audio_url?: string;
  audio_duration?: number;

  // Metadata
  tags: string[];
  metadata: Record<string, unknown>;

  created_at: string;
  updated_at: string;
  created_by: string;
}

// ============================================
// FAQ SYSTEM
// ============================================

export interface FAQItem extends Omit<KnowledgeArticle, 'title' | 'content'> {
  question: string;
  answer: string;
  short_answer?: string;
  related_faqs: string[];
  applies_to_industries: string[];
}

export interface FAQCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parent_id?: string;
  icon?: string;
  color?: string;
  faq_count: number;
  children?: FAQCategory[];
  order: number;
}

export interface FAQFilters {
  search?: string;
  categories?: string[];
  industries?: string[];
  sources?: ValidationSource[];
  validation_status?: ValidationStatus[];
  agent_ids?: string[];
  has_embedding?: boolean;
  helpfulness_min?: number;
}

// 56 Industry Subcategories Structure
export interface IndustryCategory {
  id: string;
  name: string;
  code: string;
  icon?: string;
  parent_industry?: string;
  subcategories: IndustrySubcategory[];
}

export interface IndustrySubcategory {
  id: string;
  name: string;
  code: string;
  faq_count: number;
  profile_questions_count: number;
}

// ============================================
// BUSINESS PROFILE SURVEY
// ============================================

export interface SurveySection {
  id: string;
  name: string;
  description?: string;
  order: number;
  is_required: boolean;
  is_conditional: boolean;
  condition?: SectionCondition;
  questions: SurveyQuestion[];
  completion_percentage?: number;
}

export interface SectionCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'in';
  value: unknown;
}

export interface SurveyQuestion {
  id: string;
  section_id: string;
  question_text: string;
  help_text?: string;
  question_type: QuestionType;
  is_required: boolean;
  order: number;

  // Validation
  validation_rules?: ValidationRule[];

  // Options for select/multi-select
  options?: QuestionOption[];

  // Scale config
  scale_config?: {
    min: number;
    max: number;
    min_label?: string;
    max_label?: string;
  };

  // Conditional display
  is_conditional: boolean;
  show_when?: QuestionCondition;

  // AI/Data enrichment
  auto_populate_source?: 'serpapi' | 'google' | 'none';
  requires_owner_verification: boolean;

  // Metadata
  industry_specific: boolean;
  applies_to_industries?: string[];

  created_at: string;
  updated_at: string;
}

export interface ValidationRule {
  type: 'required' | 'min_length' | 'max_length' | 'pattern' | 'min' | 'max' | 'custom';
  value?: unknown;
  message: string;
}

export interface QuestionOption {
  id: string;
  label: string;
  value: string;
  order: number;
  is_other: boolean;
}

export interface QuestionCondition {
  question_id: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'in' | 'is_empty' | 'is_not_empty';
  value: unknown;
}

// ============================================
// VECTOR SEARCH
// ============================================

export interface SearchQuery {
  query: string;
  filters?: {
    categories?: string[];
    industries?: string[];
    sources?: ValidationSource[];
    validation_status?: ValidationStatus[];
    agent_ids?: string[];
  };
  limit?: number;
  threshold?: number;
  search_type?: 'semantic' | 'keyword' | 'hybrid';
}

export interface SearchResult {
  id: string;
  title: string;
  content: string;
  category: string;
  similarity_score: number;
  source: ValidationSource;
  validation_status: ValidationStatus;
  highlights?: string[];
  audio_url?: string;
}

export interface SearchAnalytics {
  query: string;
  results_count: number;
  avg_similarity: number;
  response_time_ms: number;
  clicked_result_id?: string;
  was_helpful?: boolean;
  timestamp: string;
}

// ============================================
// AI TRAINING
// ============================================

export interface TrainingDataset {
  id: string;
  name: string;
  description?: string;
  agent_ids: string[];
  article_ids: string[];
  faq_ids: string[];

  total_items: number;
  verified_items: number;

  status: 'draft' | 'ready' | 'training' | 'active' | 'archived';
  last_trained_at?: string;

  created_at: string;
  updated_at: string;
}

export interface ValidationQueueItem {
  id: string;
  content_type: 'faq' | 'article' | 'profile_answer';
  content_id: string;
  title: string;
  content_preview: string;

  current_source: ValidationSource;
  suggested_source?: ValidationSource;

  serpapi_data?: Record<string, unknown>;
  google_data?: Record<string, unknown>;
  website_data?: Record<string, unknown>;

  confidence_score: number;
  discrepancies?: string[];

  assigned_to?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';

  created_at: string;
}

export interface AgentKnowledgeConfig {
  agent_id: string;
  agent_name: string;
  agent_type: string;

  allowed_categories: string[];
  allowed_industries: string[];
  excluded_article_ids: string[];

  use_faq_first: boolean;
  confidence_threshold: number;
  fallback_behavior: 'escalate' | 'general_response' | 'ask_clarification';

  total_accessible_articles: number;
  total_accessible_faqs: number;

  updated_at: string;
}

// ============================================
// PRESENTATION SYSTEM
// ============================================

export interface Presentation {
  id: string;
  presentation_id?: string;
  title?: string; // Alternative to meta.title
  description?: string;
  template_id?: string;
  meta?: PresentationMeta | {
    title?: string;
    theme?: string | 'blue' | 'green' | 'purple' | 'orange';
    duration?: number;
    slideCount?: number;
    audioBaseUrl?: string;
  };
  presenter: Presenter | {
    id: string;
    name: string;
    role?: string;
    personality?: string;
    communication_style?: string;
  };
  slides: Slide[];
  call_to_action?: CallToAction;
  theme?: {
    primaryColor?: string;
    secondaryColor?: string;
  };
  created_at?: string;
  updated_at?: string;
}

export interface PresentationMeta {
  title: string;
  target_audience: string;
  email_hook?: string;
  theme: 'blue' | 'green' | 'purple' | 'orange';
  version: string;
  estimated_duration?: string;
}

export interface Presenter {
  name: string;
  role: string;
  avatar_style: 'professional-female' | 'professional-male' | 'friendly-female' | 'friendly-male';
  avatar_url?: string;
  voice_id: string;
}

export interface Slide {
  id: number;
  component: SlideComponentType;
  content: Record<string, unknown>;
  narration?: string;
  audio_url?: string;
  audioUrl?: string; // Alias for audio_url for compatibility
  audio_duration?: number;
  requiresPersonalization?: boolean;
}

export type SlideComponentType =
  | 'HeroSlide'
  | 'ProblemSlide'
  | 'SolutionSlide'
  | 'StatsSlide'
  | 'ComparisonSlide'
  | 'ProcessSlide'
  | 'TestimonialSlide'
  | 'PricingSlide'
  | 'CTASlide'
  | 'FeaturesGridSlide'
  | 'TimelineSlide'
  | 'TeamSlide'
  | 'FAQSlide'
  | 'VideoSlide'
  | 'DemoSlide'
  | 'QuoteGallerySlide'
  | 'ROICalculatorSlide'
  | 'IntegrationSlide'
  | 'ChecklistSlide'
  | 'ContactSlide';

export interface CallToAction {
  primary_button: {
    text: string;
    url: string;
  };
  secondary_button?: {
    text: string;
    url: string;
  };
}

// ============================================
// ELEVEN LABS TTS
// ============================================

export interface ElevenLabsVoice {
  voice_id: string;
  name: string;
  category: string;
  preview_url?: string;
  settings: VoiceSettings;
}

export interface VoiceSettings {
  stability: number;
  similarity_boost: number;
  style?: number;
  use_speaker_boost?: boolean;
}

export interface TTSRequest {
  text: string;
  voice_id: string;
  model_id?: string;
  voice_settings?: VoiceSettings;
  output_format?: 'mp3_44100_128' | 'mp3_22050_32' | 'pcm_16000' | 'pcm_22050' | 'pcm_44100';
}

export interface TTSJob {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  content_type: 'slide' | 'faq' | 'ai_response';
  content_id: string;
  text: string;
  voice_id: string;
  audio_url?: string;
  error_message?: string;
  created_at: string;
  completed_at?: string;
}

// ============================================
// API RESPONSES
// ============================================

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  status: number;
}

// ============================================
// UI STATE
// ============================================

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface SidebarSection {
  id: string;
  label: string;
  icon: string;
  href?: string;
  badge?: number;
  children?: SidebarItem[];
}

export interface SidebarItem {
  id: string;
  label: string;
  href: string;
  badge?: number;
  isActive?: boolean;
}
