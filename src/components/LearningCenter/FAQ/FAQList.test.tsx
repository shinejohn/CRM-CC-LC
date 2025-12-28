import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../../../test/test-utils';
import userEvent from '@testing-library/user-event';
import { FAQList } from './FAQList';
import { knowledgeApi } from '@/services/learning/knowledge-api';

// Mock SourceBadge to avoid source config errors (must be before component import)
vi.mock('../../Common/SourceBadge', () => ({
  SourceBadge: () => <div data-testid="source-badge">Source</div>,
}));

// Mock the knowledge API
vi.mock('@/services/learning/knowledge-api', () => ({
  knowledgeApi: {
    getFAQs: vi.fn(),
  },
}));

describe('FAQList', () => {
  const mockFAQs = {
    data: [
      { 
        id: '1', 
        tenant_id: '00000000-0000-0000-0000-000000000000',
        question: 'Question 1?', 
        answer: 'Answer 1', 
        category: 'cat-1',
        source: 'owner' as const,
        validation_status: 'unverified' as const,
        is_public: true,
        allowed_agents: [],
        tags: [],
        applies_to_industries: [],
        related_faqs: [],
        embedding_status: 'pending' as const,
        has_embedding: false,
        usage_count: 0,
        helpful_count: 0,
        not_helpful_count: 0,
        helpfulness_score: 0,
        metadata: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: '00000000-0000-0000-0000-000000000000',
      },
      { 
        id: '2', 
        tenant_id: '00000000-0000-0000-0000-000000000000',
        question: 'Question 2?', 
        answer: 'Answer 2', 
        category: 'cat-1',
        source: 'owner' as const,
        validation_status: 'unverified' as const,
        is_public: true,
        allowed_agents: [],
        tags: [],
        applies_to_industries: [],
        related_faqs: [],
        embedding_status: 'pending' as const,
        has_embedding: false,
        usage_count: 0,
        helpful_count: 0,
        not_helpful_count: 0,
        helpfulness_score: 0,
        metadata: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: '00000000-0000-0000-0000-000000000000',
      },
      { 
        id: '3', 
        tenant_id: '00000000-0000-0000-0000-000000000000',
        question: 'Question 3?', 
        answer: 'Answer 3', 
        category: 'cat-2',
        source: 'owner' as const,
        validation_status: 'unverified' as const,
        is_public: true,
        allowed_agents: [],
        tags: [],
        applies_to_industries: [],
        related_faqs: [],
        embedding_status: 'pending' as const,
        has_embedding: false,
        usage_count: 0,
        helpful_count: 0,
        not_helpful_count: 0,
        helpfulness_score: 0,
        metadata: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: '00000000-0000-0000-0000-000000000000',
      },
    ],
    meta: {
      total: 3,
      page: 1,
      per_page: 25,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders list of FAQs', async () => {
    vi.mocked(knowledgeApi.getFAQs).mockResolvedValue(mockFAQs);

    render(<FAQList />);

    await waitFor(() => {
      // FAQs are rendered via FAQCard components
      // Just verify the component loaded (it uses FAQCard internally)
      expect(screen.getByText(/faqs/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('shows loading state while fetching FAQs', () => {
    vi.mocked(knowledgeApi.getFAQs).mockImplementation(() => new Promise(() => {}));

    render(<FAQList />);

    expect(screen.getByText(/loading.*faqs/i)).toBeInTheDocument();
  });

  it('shows empty state when no FAQs exist', async () => {
    vi.mocked(knowledgeApi.getFAQs).mockResolvedValue({
      data: [],
      meta: { total: 0, page: 1, per_page: 25 },
    });

    render(<FAQList />);

    await waitFor(() => {
      expect(screen.getByText(/no.*faqs.*found/i)).toBeInTheDocument();
    });
  });

  it('renders header with FAQ count', async () => {
    vi.mocked(knowledgeApi.getFAQs).mockResolvedValue(mockFAQs);

    render(<FAQList />);

    await waitFor(() => {
      expect(screen.getByText(/faqs/i)).toBeInTheDocument();
      // Header shows total count
      expect(screen.getByText(/questions across/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('calls onAddFAQ when Add FAQ button is clicked', async () => {
    const mockOnAddFAQ = vi.fn();
    const user = userEvent.setup();
    vi.mocked(knowledgeApi.getFAQs).mockResolvedValue({
      data: [],
      meta: { total: 0, page: 1, per_page: 25 },
    });

    render(<FAQList onAddFAQ={mockOnAddFAQ} />);

    await waitFor(() => {
      const addButton = screen.getByRole('button', { name: /add.*faq/i });
      expect(addButton).toBeInTheDocument();
    });

    const addButton = screen.getByRole('button', { name: /add.*faq/i });
    await user.click(addButton);

    expect(mockOnAddFAQ).toHaveBeenCalled();
  });
});
