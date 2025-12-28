import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../../../test/test-utils';
import userEvent from '@testing-library/user-event';
import { FAQCard } from './FAQCard';
import type { FAQItem } from '@/types/learning';

// Mock child components
vi.mock('../Common/SourceBadge', () => ({
  SourceBadge: () => <div data-testid="source-badge">Source</div>,
}));

vi.mock('../Common/ValidationIndicator', () => ({
  ValidationIndicator: () => <div data-testid="validation-indicator">Validation</div>,
}));

vi.mock('../Common/UsageStats', () => ({
  UsageStats: () => <div data-testid="usage-stats">Stats</div>,
}));

vi.mock('../Common/EmbeddingIndicator', () => ({
  EmbeddingIndicator: () => <div data-testid="embedding-indicator">Embedding</div>,
}));

describe('FAQCard', () => {
  const mockFAQ: FAQItem = {
    id: '1',
    tenant_id: '00000000-0000-0000-0000-000000000000',
    question: 'Test Question?',
    answer: 'Test answer content',
    category: 'general',
    source: 'owner',
    validation_status: 'unverified',
    is_public: true,
    allowed_agents: [],
    tags: [],
    applies_to_industries: [],
    related_faqs: [],
    embedding_status: 'pending',
    has_embedding: false,
    usage_count: 0,
    helpful_count: 0,
    not_helpful_count: 0,
    helpfulness_score: 0,
    metadata: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: '00000000-0000-0000-0000-000000000000',
  };

  it('renders FAQ question and answer', () => {
    render(<FAQCard faq={mockFAQ} />);

    expect(screen.getByText('Test Question?')).toBeInTheDocument();
    expect(screen.getByText(/test answer content/i)).toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', async () => {
    const mockOnEdit = vi.fn();
    const user = userEvent.setup();

    render(<FAQCard faq={mockFAQ} onEdit={mockOnEdit} />);

    const editButton = screen.getByRole('button', { name: /edit/i });
    await user.click(editButton);

    expect(mockOnEdit).toHaveBeenCalledWith(mockFAQ.id);
  });

  it('calls onView when view button is clicked', async () => {
    const mockOnView = vi.fn();
    const user = userEvent.setup();

    render(<FAQCard faq={mockFAQ} onView={mockOnView} />);

    const viewButton = screen.getByRole('button', { name: /view/i });
    await user.click(viewButton);

    expect(mockOnView).toHaveBeenCalledWith(mockFAQ.id);
  });

  it('shows selected state when isSelected is true', () => {
    const mockOnSelect = vi.fn();
    render(<FAQCard faq={mockFAQ} isSelected={true} onSelect={mockOnSelect} />);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();
  });

  it('renders category badge when category exists', () => {
    render(<FAQCard faq={mockFAQ} />);

    expect(screen.getByText('general')).toBeInTheDocument();
  });
});
