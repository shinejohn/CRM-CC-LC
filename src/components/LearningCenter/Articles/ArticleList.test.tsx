import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../../../test/test-utils';
import { ArticleList } from './ArticleList';
import { knowledgeApi } from '@/services/learning/knowledge-api';

vi.mock('@/services/learning/knowledge-api', () => ({
  knowledgeApi: {
    getArticles: vi.fn(),
    deleteKnowledge: vi.fn(),
  },
}));

vi.mock('../Common/SourceBadge', () => ({
  SourceBadge: () => <div data-testid="source-badge">Source</div>,
}));

vi.mock('../Common/ValidationIndicator', () => ({
  ValidationIndicator: () => <div data-testid="validation-indicator">Validation</div>,
}));

vi.mock('../Common/EmbeddingIndicator', () => ({
  EmbeddingIndicator: () => <div data-testid="embedding-indicator">Embedding</div>,
}));

describe('ArticleList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders article list', async () => {
    vi.mocked(knowledgeApi.getArticles).mockResolvedValue({
      data: [],
      meta: { total: 0, page: 1, per_page: 25 },
    });

    render(<ArticleList />);

    await waitFor(() => {
      expect(screen.getByText(/articles/i)).toBeInTheDocument();
    });
  });

  it('shows loading state while fetching articles', () => {
    vi.mocked(knowledgeApi.getArticles).mockImplementation(() => new Promise(() => {}));

    render(<ArticleList />);

    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });
});
